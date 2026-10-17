#!/usr/bin/env python3
"""Generate private, minimized Kross source-row staging; never connect to SQL.

Rows match integrations.source_row_archive. This preserves source evidence, not
canonical reservation/payment truth. Original workbooks remain authoritative in
Library. All tenant/property identifiers must be supplied by the caller.

Usage:
  python3 scripts/kross-source-staging.py --input-manifest INPUT.json \
    --output-jsonl PRIVATE.jsonl --output-manifest SUMMARY.json \
    --org-id ORG_UUID --dreamcatcher-property-id PROPERTY_UUID
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import date, datetime, time, timezone
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import posixpath
import re
import tempfile
import unicodedata
import uuid
import xml.etree.ElementTree as ET
import zipfile

import openpyxl


SCHEMA_VERSION = "kross_source_archive_staging_v1"
SPREADSHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


def header_key(value):
    """Match schema labels without changing the original column ordinals."""
    value = unicodedata.normalize("NFKD", str(value or "")).casefold()
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in value if not unicodedata.combining(c)))


def keys(labels):
    return {header_key(label) for label in labels.split("|")}


# Fail closed: newly introduced/unknown source columns get presence flags only.
ALLOWLISTS = {
    "reservations": keys(
        "Number|Número|Code|Código|Nights|Noches|N. Rooms|N. Habitaciones|Rooms|Habitaciones|"
        "Guests|Huéspedes|Arrival|Llegada|Departure|Salida|Reservation Date|Fecha reserva|Last operation|"
        "Ultima operación|Cancelation date|Fecha de cancelación|Channel|Portal|Status|Estado|"
        "Accommodation|Estancia|Tax|Tasa turística|Cleaning|Limpieza|Services|Servicios|Total|"
        "Collected commissions|Comisiones cobradas|Retained commissions|Comisiones retenidas"),
    "cash_ledger": keys(
        "Code|Código|Date|Fecha|Registration date|Fecha de registración|"
        "Payment Method|Método de pago|Total Amount (Conv $)|Importe total (Conv $)|"
        "Total $|Total &#8353;"),
    "services": keys(
        "Charge date|Data addebito|Input Date|Reservation code|Arrival|Departure|Nights|"
        "Room|Service|Category|Unit Price (VAT Excluded)|Unit Price|Qt|Total (VAT Excluded)|Total"),
    "blocks": keys("ID|Tipo|Fecha de creación|Last update|Habitación/Apartamento|Desde el|Al|Activo|Canc"),
    "reviews": keys(
        "Portal|Fecha|Id room type|Apt|Rating|Cleaning rating|Comfort rating|Facilities rating|"
        "Location rating|Staff rating|Communication rating|Check-in rating|Accuracy rating|"
        "Value rating|País|Reservation code|Arrival|Departure|Noches|"
        "En Motor de reservas|Review expiration date"),
}
ROOM_HEADERS = keys("Rooms|Room|Habitaciones|Habitación/Apartamento")
ALLOWED_DC_ROOMS = set(range(12)) | set(range(21, 29))


def formula_like(value):
    return isinstance(value, str) and value.lstrip().startswith(("=", "+", "-", "@"))


def numeric_literals(path):
    """Read numeric XML lexemes directly, avoiding Python float round trips."""
    result = {}
    with zipfile.ZipFile(path) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in relationships
                   if rel.attrib.get("TargetMode") != "External"}
        for sheet in workbook.findall(f"{{{SPREADSHEET_NS}}}sheets/{{{SPREADSHEET_NS}}}sheet"):
            target = targets.get(sheet.attrib.get(f"{{{REL_NS}}}id"))
            if not target:
                raise ValueError("Missing internal worksheet relationship")
            member = (target.lstrip("/") if target.startswith("/")
                      else posixpath.normpath(posixpath.join("xl", target)))
            if member.startswith("../") or member not in archive.namelist():
                raise ValueError("Invalid worksheet package path")
            xml = ET.fromstring(archive.read(member))
            cells = {}
            for cell in xml.iter(f"{{{SPREADSHEET_NS}}}c"):
                value = cell.find(f"{{{SPREADSHEET_NS}}}v")
                if cell.attrib.get("t", "n") == "n" and value is not None and value.text is not None:
                    cells[cell.attrib["r"]] = value.text
            result[sheet.attrib["name"]] = cells
    return result


def cell_value(cell, numeric_xml):
    value = cell.value
    if value is None:
        return None, "blank"
    if isinstance(value, bool):
        return value, "boolean"
    if isinstance(value, (datetime, date, time)):
        # Naive source dates stay naive literals: never attach an assumed zone.
        return value.isoformat(), "datetime_literal"
    if cell.data_type == "n" and isinstance(value, (int, float, Decimal)):
        raw = numeric_xml.get(cell.coordinate)
        if raw is None:
            raise ValueError("Missing numeric XML literal; refusing a float conversion")
        Decimal(raw)  # Validate a finite decimal representation without converting it.
        if not Decimal(raw).is_finite():
            raise ValueError("Nonfinite numeric source cell")
        return raw, "decimal_literal"
    return str(value), "text"


def source_created_at(source, provenance):
    literal = source.get("source_created_at")
    if literal is None:
        return None
    try:
        parsed = datetime.fromisoformat(str(literal).replace("Z", "+00:00"))
    except ValueError:
        provenance["source_created_at_literal"] = str(literal)
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        provenance["source_created_at_literal"] = str(literal)
        return None
    return parsed.isoformat()


def property_scope(columns, property_id):
    candidates = [col for col in columns if header_key(col["header"]) in ROOM_HEADERS]
    if not candidates:
        return None
    for column in candidates:
        value = column.get("value")
        if not isinstance(value, str) or not value.strip():
            return None
        tokens = value.split(",")
        for token in tokens:
            match = re.fullmatch(r"#(\d+)", token.strip())
            if not match or int(match.group(1)) not in ALLOWED_DC_ROOMS:
                return None
    return property_id


def private_atomic_write(path, chunks):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_path = tempfile.mkstemp(prefix=".kross-staging-", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            for chunk in chunks:
                handle.write(chunk)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
        os.chmod(path, 0o600)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


def stage_sources(input_manifest, *, org_id, dreamcatcher_property_id,
                  preserved_at, output_jsonl, output_manifest):
    """Return a no-PII summary and write local JSONL; perform no network/SQL I/O."""
    org_id = str(uuid.UUID(str(org_id)))
    dreamcatcher_property_id = str(uuid.UUID(str(dreamcatcher_property_id)))
    captured = datetime.fromisoformat(str(preserved_at).replace("Z", "+00:00"))
    if captured.tzinfo is None or captured.utcoffset() is None:
        raise ValueError("preserved_at requires an explicit timezone")
    if Path(output_jsonl).resolve() == Path(output_manifest).resolve():
        raise ValueError("Outputs must be different paths")
    preserved_at = captured.isoformat()
    rows = []
    seen = set()
    formula_count = redacted_count = duplicates = 0
    classifications = Counter()
    kinds = Counter()
    sources_summary = []
    sources = input_manifest.get("sources", [])
    if not sources:
        raise ValueError("No source files specified")
    source_paths = {Path(source["path"]).resolve() for source in sources}
    if Path(output_jsonl).resolve() in source_paths or Path(output_manifest).resolve() in source_paths:
        raise ValueError("Output cannot overwrite a source workbook")
    for source in sources:
        path = Path(source["path"])
        kind = source["kind"]
        if kind not in ALLOWLISTS:
            raise ValueError("Unrecognized source kind")
        actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if source.get("sha256") != actual_hash:
            raise ValueError("Source file hash mismatch")
        numeric_xml = numeric_literals(path)
        wb = openpyxl.load_workbook(path, data_only=False, read_only=True)
        source_count = 0
        try:
            for sheet_number, sheet in enumerate(wb.worksheets, start=1):
                row_iterator = sheet.iter_rows()
                header_cells = next(row_iterator, ())
                headers = [str(cell.value) if cell.value is not None else "" for cell in header_cells]
                for row_number, row in enumerate(row_iterator, start=2):
                    if not any(cell.value is not None for cell in row):
                        continue
                    record_digest = hashlib.sha256(
                        f"{actual_hash}\x00{sheet.title}\x00{row_number}".encode()).hexdigest()
                    record_id = "sha256:" + record_digest
                    if record_id in seen:
                        duplicates += 1
                        continue
                    seen.add(record_id)
                    provenance = {
                        "file_sha256": actual_hash,
                        "library_file_id": source.get("library_metadata", {}).get("user.library-file-id"),
                        "library_file_version": source.get("library_metadata", {}).get("user.library-file-version"),
                        "sheet_ordinal": sheet_number, "source_row_number": row_number,
                        "source_kind": kind,
                        "source_date_policy": "preserve_literal_do_not_infer_timezone",
                    }
                    source_time = source_created_at(source, provenance)
                    columns = []
                    for ordinal, cell in enumerate(row, start=1):
                        header = headers[ordinal - 1] if ordinal <= len(headers) else ""
                        header_is_formula = formula_like(header)
                        col = {"ordinal": ordinal, "header": "[formula_header_omitted]" if header_is_formula else header}
                        is_formula = cell.data_type == "f" or formula_like(cell.value)
                        if is_formula or header_is_formula:
                            col.update(redacted=True, present=cell.value is not None, formula_present=True)
                            formula_count += 1
                        elif header_key(header) not in ALLOWLISTS[kind]:
                            col.update(redacted=True, present=cell.value is not None)
                            redacted_count += 1
                        else:
                            value, value_type = cell_value(cell, numeric_xml[sheet.title])
                            col.update(value=value, value_type=value_type)
                        columns.append(col)
                    assigned_property = property_scope(columns, dreamcatcher_property_id)
                    classification = "dreamcatcher_scoped_source" if assigned_property else "review_scope"
                    payload = {"schema_version": SCHEMA_VERSION, "provenance": provenance, "columns": columns}
                    rows.append({
                        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"kross-source-archive:{org_id}:{record_id}")),
                        "org_id": org_id, "property_id": assigned_property,
                        "source_system": "kross", "source_base_id": "sha256:" + actual_hash,
                        "source_base_name": path.name,
                        "source_table_id": "worksheet:" + str(sheet_number),
                        "source_table_name": sheet.title,
                        "source_record_id": record_id, "source_created_at": source_time,
                        "source_payload": payload, "classification": classification,
                        "canonical_hint": f"kross:{kind}:source_only",
                        "preservation_reason": "Minimized Kross source evidence; original retained in Library; not canonical reconciliation.",
                        "preserved_at": preserved_at,
                    })
                    source_count += 1
                    kinds[kind] += 1
                    classifications[classification] += 1
        finally:
            wb.close()
        sources_summary.append({
            "file_name": path.name, "sha256": actual_hash, "kind": kind,
            "library_file_id": source.get("library_metadata", {}).get("user.library-file-id"),
            "rows_staged_from_this_occurrence": source_count,
        })
    chunks = [json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows]
    digest = hashlib.sha256("".join(chunks).encode()).hexdigest()
    summary = {
        "schema_version": SCHEMA_VERSION, "target_table": "integrations.source_row_archive",
        "import_status": "not_imported", "preserved_at": preserved_at,
        "rows_staged": len(rows), "deduplicated_file_rows": duplicates,
        "formula_cells_omitted": formula_count, "redacted_cells": redacted_count,
        "classification_counts": dict(classifications), "entity_counts": dict(kinds),
        "source_count": len(sources), "sources": sources_summary,
        "jsonl_sha256": digest,
        "coverage_certified": False,
        "warnings": [
            "This is private source staging, not an executed database import.",
            "Snapshots overlap; distinct source rows are not distinct business transactions.",
            "Unproven property scope stays null; no property inferred through a reservation.",
            "No upstream completeness contract or continuously running synchronization is certified.",
        ],
    }
    private_atomic_write(output_jsonl, chunks)
    private_atomic_write(output_manifest, [json.dumps(summary, ensure_ascii=False, indent=2) + "\n"])
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-manifest", required=True, type=Path)
    parser.add_argument("--output-jsonl", required=True, type=Path)
    parser.add_argument("--output-manifest", required=True, type=Path)
    parser.add_argument("--org-id", required=True)
    parser.add_argument("--dreamcatcher-property-id", required=True)
    parser.add_argument("--preserved-at", default=None,
                        help="Aware timestamp for this staging run; source naive dates remain unchanged")
    args = parser.parse_args()
    try:
        summary = stage_sources(
            json.loads(args.input_manifest.read_text(encoding="utf-8")), org_id=args.org_id,
            dreamcatcher_property_id=args.dreamcatcher_property_id,
            preserved_at=args.preserved_at or datetime.now(timezone.utc).isoformat(),
            output_jsonl=args.output_jsonl, output_manifest=args.output_manifest)
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as exc:
        parser.exit(1, f"Staging failed: {type(exc).__name__}. No SQL operation was attempted.\n")
    print(json.dumps({key: summary[key] for key in (
        "import_status", "rows_staged", "deduplicated_file_rows", "classification_counts", "entity_counts",
        "jsonl_sha256")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
