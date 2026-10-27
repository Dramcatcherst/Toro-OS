"""Offline, partial CE4.4 reference check. Never signs, sends or posts documents."""
import argparse
import datetime as dt
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

LIMIT = 2 * 1024 * 1024
BASE = "https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/"
ROOTS = {
    "FacturaElectronica": "facturaElectronica",
    "NotaCreditoElectronica": "notaCreditoElectronica",
    "NotaDebitoElectronica": "notaDebitoElectronica",
    "TiqueteElectronico": "tiqueteElectronico",
    "FacturaElectronicaCompra": "facturaElectronicaCompra",
    "FacturaElectronicaExportacion": "facturaElectronicaExportacion",
    "ReciboElectronicoPago": "reciboElectronicoPago",
}
REASONS = {"01", "02", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "99"}
TYPES = {f"{n:02}" for n in range(1, 21)} | {"99"}
NOTES = {"NotaCreditoElectronica", "NotaDebitoElectronica"}


def timestamp(value):
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})", value):
        raise ValueError("timestamp")
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def inspect_xml(raw: bytes, expected_issuer: str):
    # Output is deliberately restricted: no XML, names, tax IDs, amounts, keys,
    # file paths, exception messages or signature material leave this function.
    errors, reviews, periods = [], [], set()

    def report():
        return {"status": "BLOCKED" if errors else "LOCAL_CHECKS_ONLY",
                "errors": sorted(set(errors)), "review": sorted(set(reviews)),
                "accountingPeriodsToReview": sorted(periods),
                "haciendaAcceptance": "NOT_VERIFIED", "providerAccount": "NOT_VERIFIED",
                "productionReady": False}

    if not isinstance(raw, bytes) or len(raw) > LIMIT:
        errors.append("INPUT_SIZE_OR_TYPE"); return report()
    try:
        # UTF-8 only; rejecting other encodings also prevents DTD filtering bypass.
        decoded = raw.decode("utf-8-sig")
        if re.search(r"<!DOCTYPE|<!ENTITY", decoded, re.I):
            raise ValueError("DTD")
        if re.search(r"encoding\s*=\s*['\"](?!utf-8['\"])", decoded, re.I):
            raise ValueError("encoding")
        root = ET.fromstring(decoded)
    except (ValueError, ET.ParseError):
        errors.append("UNSAFE_OR_INVALID_XML"); return report()
    kind = root.tag.rsplit("}", 1)[-1]
    ns = BASE + ROOTS.get(kind, "unsupported")
    if kind not in ROOTS or root.tag != "{" + ns + "}" + kind:
        errors.append("UNSUPPORTED_ROOT_OR_VERSION"); return report()

    def scalar(node, path, optional=False):
        found = node.findall("/".join("{" + ns + "}" + p for p in path.split("/")))
        if not found and optional:
            return ""
        if len(found) != 1 or len(found[0]):
            raise ValueError("scalar")
        return (found[0].text or "").strip()

    try:
        if not re.fullmatch(r"[A-Za-z0-9-]{1,30}", expected_issuer or ""):
            errors.append("EXPECTED_ISSUER_REQUIRED"); return report()
        actual_issuer = scalar(root, "Emisor/Identificacion/Numero")
        if actual_issuer.replace("-", "").lower() != expected_issuer.replace("-", "").lower():
            errors.append("ISSUER_SCOPE_MISMATCH"); return report()
        emitted = timestamp(scalar(root, "FechaEmision"))
        references = root.findall("{" + ns + "}InformacionReferencia")
        if not references:
            errors.append("NO_REFERENCE_CASE_TO_CHECK"); return report()
        if len(references) > 10:
            errors.append("REFERENCE_LIMIT"); return report()
        for reference in references:
            code = scalar(reference, "Codigo", optional=True)
            doc = scalar(reference, "TipoDocIR")
            if doc not in TYPES or doc == "09":
                errors.append("REFERENCE_TYPE_UNKNOWN_OR_DISABLED")
            if doc == "16" and kind != "FacturaElectronicaCompra":
                errors.append("REFERENCE_TYPE16_REQUIRES_PURCHASE_INVOICE")
            if kind == "ReciboElectronicoPago" and doc not in {"01", "04", "07", "08", "10", "20"}:
                errors.append("REP_REFERENCE_TYPE_UNSUPPORTED")
            if code not in REASONS and not (doc == "13" and not code):
                errors.append("REFERENCE_CODE_UNKNOWN")
            number = scalar(reference, "Numero", optional=doc == "13")
            reason = scalar(reference, "Razon", optional=doc == "13")
            if doc != "13" and (not number or len(number) > 50 or not 3 <= len(reason) <= 180):
                errors.append("REFERENCE_FIELDS_INVALID")
            if doc in {"01", "02", "03", "04", "09", "11", "12", "15", "17", "18", "19", "20"} and not re.fullmatch(r"[0-9]{50}", number):
                errors.append("REFERENCE_KEY_FORMAT")
            original = timestamp(scalar(reference, "FechaEmisionIR"))
            if original > emitted:
                errors.append("REFERENCE_IN_FUTURE")
            if code == "17" and kind != "ReciboElectronicoPago":
                errors.append("CODE17_REQUIRES_REP")
            if code == "16":
                reviews.append("VERIFY_ORIGINAL_HACIENDA_REJECTION")
                if doc != "10" or kind in NOTES:
                    errors.append("CODE16_REQUIRES_REPLACEMENT_AND_TYPE10")
            if code == "12":
                reviews.append("VERIFY_FINANCIAL_NOTE_AND_LATER_EXEMPTION")
                if kind != "NotaCreditoElectronica":
                    errors.append("CODE12_REQUIRES_CREDIT_NOTE")
            if code == "99" and not 5 <= len(scalar(reference, "CodigoReferenciaOTRO")) <= 100:
                errors.append("OTHER_REFERENCE_DESCRIPTION_INVALID")
            if doc == "99" and not 5 <= len(scalar(reference, "TipoDocRefOTRO")) <= 100:
                errors.append("OTHER_DOCUMENT_DESCRIPTION_INVALID")
            if kind in NOTES and code in {"13", "14"}:
                periods.add(original.strftime("%Y-%m"))
                reviews.append("VERIFY_ORIGINAL_PERIOD_WITH_ACCOUNTING")
                if code == "13":
                    reviews.append("IF_REISSUED_VERIFY_LINKED_CODE15_DOCUMENT")
            elif kind in NOTES and code in {"01", "02", "06", "12"}:
                periods.add(emitted.strftime("%Y-%m"))
            if code == "15":
                reviews.append("VERIFY_LINK_TO_MATERIAL_ERROR_CORRECTION")
    except (ValueError, TypeError, OverflowError):
        errors.append("REQUIRED_FIELD_OR_TIMESTAMP_INVALID")
    reviews.append("FULL_XSD_SIGNATURE_TOTALS_SOURCE_AND_STAG_REVIEW_REQUIRED")
    return report()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("xml", type=Path)
    parser.add_argument("--expected-issuer", required=True)
    args = parser.parse_args()
    try:
        with args.xml.open("rb") as source:
            result = inspect_xml(source.read(LIMIT + 1), args.expected_issuer)
    except OSError:
        result = {"status": "BLOCKED", "errors": ["INPUT_UNAVAILABLE"], "productionReady": False}
    print(json.dumps(result, ensure_ascii=False))
    return 2 if result["status"] == "BLOCKED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
