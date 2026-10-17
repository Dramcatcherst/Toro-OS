"""Real-workbook tests for the private Kross archive staging generator."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import tempfile
import unittest
import uuid
import zipfile
from datetime import datetime

import openpyxl


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/kross-source-staging.py"
ORG = str(uuid.uuid5(uuid.NAMESPACE_DNS, "test-org.example"))
DC = str(uuid.uuid5(uuid.NAMESPACE_DNS, "test-dc.example"))
PRESERVED_AT = "2026-10-17T11:00:00+00:00"
if SCRIPT.exists():
    spec = importlib.util.spec_from_file_location("kross_source_staging", SCRIPT)
    API = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(API)
else:
    API = None


class StagingTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def source(self, headers, rows, kind="reservations", name="source.xlsx"):
        path = self.root / name
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Worksheet"
        ws.append(headers)
        for row in rows:
            ws.append(row)
        wb.save(path)
        return self.source_meta(path, kind)

    def source_meta(self, path, kind):
        return {"path": str(path), "kind": kind,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "library_metadata": {"user.library-file-id": "libfile_test", "user.library-file-version": "0"}}

    def stage(self, sources, suffix=""):
        self.assertTrue(API is not None and callable(getattr(API, "stage_sources", None)),
                        "Missing reusable stage_sources generator")
        out = self.root / ("rows" + suffix + ".jsonl")
        manifest = self.root / ("manifest" + suffix + ".json")
        result = API.stage_sources(
            {"sources": sources}, org_id=ORG, dreamcatcher_property_id=DC,
            preserved_at=PRESERVED_AT, output_jsonl=out, output_manifest=manifest)
        records = [json.loads(line) for line in out.read_text().splitlines()]
        return records, json.loads(manifest.read_text()), result

    def test_exact_archive_schema_and_stable_file_row_deduplication(self):
        source = self.source(["Number", "Rooms", "Total"], [["1/2026", "#1", 10]])
        rows, manifest, _ = self.stage([source, source])
        again, _, _ = self.stage([source], "_again")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["id"], again[0]["id"])
        self.assertEqual(rows[0]["source_record_id"], again[0]["source_record_id"])
        self.assertEqual(manifest["deduplicated_file_rows"], 1)
        self.assertEqual(set(rows[0]), {
            "id", "org_id", "property_id", "source_system", "source_base_id", "source_base_name",
            "source_table_id", "source_table_name", "source_record_id", "source_created_at", "source_payload",
            "classification", "canonical_hint", "preservation_reason", "preserved_at"})
        self.assertEqual(rows[0]["org_id"], ORG)
        self.assertEqual(rows[0]["preserved_at"], PRESERVED_AT)
        self.assertEqual(manifest["import_status"], "not_imported")

    def test_duplicate_headers_keep_independent_positions(self):
        source = self.source(["Rating", "Rating", "Review text"], [[8, 9, "SECRET_REVIEW"]], "reviews")
        rows, _, _ = self.stage([source])
        cols = rows[0]["source_payload"]["columns"]
        self.assertEqual([(c["ordinal"], c["header"], c.get("value")) for c in cols[:2]],
                         [(1, "Rating", "8"), (2, "Rating", "9")])
        self.assertEqual(len(cols), 3)
        self.assertNotIn("SECRET_REVIEW", json.dumps(rows))

    def test_scope_requires_only_explicit_dreamcatcher_rooms(self):
        rooms = ["#0, #11, #21, #28", "#21, ST #1", None, "DREAMCATCHER VILLA", "#12", "#1x"]
        source = self.source(["Number", "Rooms"], [[str(i), room] for i, room in enumerate(rooms)])
        rows, _, _ = self.stage([source])
        self.assertEqual(rows[0]["property_id"], DC)
        for row in rows[1:]:
            self.assertIsNone(row["property_id"])
            self.assertEqual(row["classification"], "review_scope")

    def test_naive_dates_preserve_literal_without_inventing_timezone(self):
        source = self.source(["Number", "Rooms", "Arrival", "Last operation"],
                             [["1", "#2", datetime(2026, 10, 17), "2026-10-16 20:10:09.123456"]])
        rows, _, _ = self.stage([source])
        cells = {c["header"]: c for c in rows[0]["source_payload"]["columns"]}
        self.assertEqual(cells["Arrival"]["value"], "2026-10-17T00:00:00")
        self.assertEqual(cells["Last operation"]["value"], "2026-10-16 20:10:09.123456")
        self.assertIsNone(rows[0]["source_created_at"])

    def test_private_fields_are_presence_flags_and_original_stays_unchanged(self):
        sources = [
            self.source(["Number", "Rooms", "Name", "Notes"],
                        [["1", "#1", "SECRET_NAME", "SECRET_NOTE"]], name="reservations.xlsx"),
            self.source(["Reserva", "Pago", "Operador", "Depósito", "Documents", "Total $"],
                        [["1", "SECRET_PAYMENT", "SECRET_OPERATOR", "SECRET_DEPOSIT", "SECRET_DOC", "$9,50"]],
                        "cash_ledger", "payments.xlsx"),
            self.source(["Rating", "Título", "Review text", "Autor", "Respuesta"],
                        [[9, "SECRET_TITLE", "SECRET_REVIEW", "SECRET_AUTHOR", "SECRET_REPLY"]],
                        "reviews", "reviews.xlsx"),
            self.source(["ID", "Habitación/Apartamento", "Razón", "Creado por"],
                        [["1", "#1", "SECRET_REASON", "SECRET_CREATOR"]], "blocks", "blocks.xlsx")]
        rows, manifest, _ = self.stage(sources)
        self.assertNotIn("SECRET_", json.dumps(rows))
        self.assertNotIn("SECRET_", json.dumps(manifest))
        payment_cols = rows[1]["source_payload"]["columns"]
        for col in payment_cols[1:5]:
            self.assertTrue(col["redacted"])
            self.assertTrue(col["present"])
            self.assertNotIn("value", col)
        for src in sources:
            self.assertEqual(hashlib.sha256(Path(src["path"]).read_bytes()).hexdigest(), src["sha256"])

    def test_formulas_and_formula_like_text_are_omitted_not_evaluated(self):
        source = self.source(["Number", "Rooms", "Total", "Code"],
                             [["1", "#1", '=HYPERLINK("https://SECRET_FORMULA", "x")', "+SECRET_FORMULA_TEXT"]])
        rows, manifest, _ = self.stage([source])
        encoded = json.dumps(rows)
        self.assertNotIn("SECRET_FORMULA", encoded)
        cols = rows[0]["source_payload"]["columns"]
        self.assertTrue(cols[2]["formula_present"])
        self.assertTrue(cols[3]["formula_present"])
        self.assertEqual(manifest["formula_cells_omitted"], 2)

    def test_xml_numeric_literals_preserve_decimal_precision_as_strings(self):
        source = self.source(["Number", "Rooms", "Total"], [["1", "#1", 1]])
        path = Path(source["path"])
        with zipfile.ZipFile(path) as z:
            members = {n: z.read(n) for n in z.namelist()}
        original = members["xl/worksheets/sheet1.xml"].decode()
        precision = "12345678901234567890.123456789"
        replaced = re.sub(r'(<c r="C2"[^>]*>\s*<v>)[^<]*(</v>)',
                          lambda m: m.group(1) + precision + m.group(2), original)
        self.assertNotEqual(original, replaced)
        members["xl/worksheets/sheet1.xml"] = replaced.encode()
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
            for n, data in members.items():
                z.writestr(n, data)
        source = self.source_meta(path, "reservations")
        rows, _, _ = self.stage([source])
        self.assertEqual(rows[0]["source_payload"]["columns"][2]["value"], precision)

    def test_source_hash_mismatch_and_naive_preserved_at_fail_closed(self):
        source = self.source(["Number", "Rooms"], [["1", "#1"]])
        self.assertTrue(API is not None and callable(getattr(API, "stage_sources", None)),
                        "Missing reusable stage_sources generator")
        bad = dict(source, sha256="0" * 64)
        with self.assertRaisesRegex(ValueError, "hash"):
            self.stage([bad])
        with self.assertRaisesRegex(ValueError, "timezone"):
            API.stage_sources({"sources": [source]}, org_id=ORG, dreamcatcher_property_id=DC,
                              preserved_at="2026-10-17T11:00:00", output_jsonl=self.root / "bad.jsonl",
                              output_manifest=self.root / "bad.json")

    def test_cash_movements_without_reservation_are_preserved_without_scope(self):
        source = self.source(["Reservation", "Date", "Total $"],
                             [[None, datetime(2026, 1, 1), "$15,00"]], "cash_ledger")
        rows, _, _ = self.stage([source])
        self.assertEqual(len(rows), 1)
        self.assertIsNone(rows[0]["property_id"])
        self.assertEqual(rows[0]["source_payload"]["provenance"]["source_row_number"], 2)

    def test_output_paths_cannot_overwrite_original_source(self):
        source = self.source(["Number", "Rooms"], [["1", "#1"]])
        self.assertTrue(API is not None and callable(getattr(API, "stage_sources", None)),
                        "Missing reusable stage_sources generator")
        with self.assertRaisesRegex(ValueError, "source"):
            API.stage_sources({"sources": [source]}, org_id=ORG, dreamcatcher_property_id=DC,
                              preserved_at=PRESERVED_AT, output_jsonl=Path(source["path"]),
                              output_manifest=self.root / "bad.json")
        self.assertEqual(hashlib.sha256(Path(source["path"]).read_bytes()).hexdigest(), source["sha256"])

    def test_reservation_labels_in_other_exports_are_guest_names_not_keys(self):
        sources = [
            self.source(["Reservation", "Code", "Total $"],
                        [["SECRET_GUEST_CASH", "123/2026", "$5,00"]], "cash_ledger", "cash.xlsx"),
            self.source(["Reservation", "Reservation code", "Room"],
                        [["SECRET_GUEST_SERVICE", "123/2026", "#1"]], "services", "service.xlsx"),
            self.source(["Reserva", "Reservation code", "Rating"],
                        [["SECRET_GUEST_REVIEW", "123/2026", 9]], "reviews", "review.xlsx"),
        ]
        rows, _, _ = self.stage(sources)
        self.assertNotIn("SECRET_GUEST", json.dumps(rows))
        for row in rows:
            self.assertTrue(row["source_payload"]["columns"][0]["redacted"])
            self.assertEqual(row["source_payload"]["columns"][1]["value"], "123/2026")


if __name__ == "__main__":
    unittest.main()
