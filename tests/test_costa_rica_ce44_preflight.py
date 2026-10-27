import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("ce44", Path(__file__).resolve().parents[1] / "scripts/costa_rica_ce44_preflight.py")
ce44 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ce44)


def xml(kind="NotaCreditoElectronica", code="13", doc="01", original="2026-09-30T23:30:00-06:00", emitted="2026-10-28T10:00:00-06:00"):
    ns = ce44.BASE + ce44.ROOTS[kind]
    return f'''<x:{kind} xmlns:x="{ns}">
      <x:Emisor><x:Identificacion><x:Numero>SYNTHETIC-01</x:Numero></x:Identificacion></x:Emisor>
      <x:FechaEmision>{emitted}</x:FechaEmision>
      <x:InformacionReferencia><x:TipoDocIR>{doc}</x:TipoDocIR><x:Numero>{'1' * 50}</x:Numero>
      <x:FechaEmisionIR>{original}</x:FechaEmisionIR><x:Codigo>{code}</x:Codigo>
      <x:Razon>synthetic reason</x:Razon></x:InformacionReferencia></x:{kind}>'''.encode()


class PreflightTest(unittest.TestCase):
    def check(self, raw, issuer="SYNTHETIC-01"):
        return ce44.inspect_xml(raw, issuer)

    def test_original_period_for_material_error_and_both_notes(self):
        for kind in ce44.NOTES:
            for code in ["13", "14"]:
                with self.subTest(kind=kind, code=code):
                    r = self.check(xml(kind, code))
                    self.assertEqual(r["status"], "LOCAL_CHECKS_ONLY")
                    self.assertEqual(r["accountingPeriodsToReview"], ["2026-09"])
                    self.assertFalse(r["productionReady"])

    def test_current_period_old_codes_and_code12(self):
        for code in ["01", "02", "06", "12"]:
            self.assertEqual(self.check(xml(code=code))["accountingPeriodsToReview"], ["2026-10"])

    def test_code12_requires_credit_note_and_exemption_review(self):
        self.assertIn("CODE12_REQUIRES_CREDIT_NOTE", self.check(xml("NotaDebitoElectronica", "12"))["errors"])
        self.assertIn("VERIFY_FINANCIAL_NOTE_AND_LATER_EXEMPTION", self.check(xml(code="12"))["review"])

    def test_code17_only_rep_not_outgoing_payment_or_note(self):
        self.assertIn("CODE17_REQUIRES_REP", self.check(xml(code="17"))["errors"])
        self.assertEqual(self.check(xml("ReciboElectronicoPago", "17"))["errors"], [])

    def test_rejected_replacement(self):
        self.assertEqual(self.check(xml("FacturaElectronica", "16", "10"))["errors"], [])
        for kind, doc in [("NotaCreditoElectronica", "10"), ("FacturaElectronica", "01")]:
            self.assertIn("CODE16_REQUIRES_REPLACEMENT_AND_TYPE10", self.check(xml(kind, "16", doc))["errors"])

    def test_reissue_material_error_needs_link_verification(self):
        self.assertIn("VERIFY_LINK_TO_MATERIAL_ERROR_CORRECTION", self.check(xml("FacturaElectronica", "15"))["review"])

    def test_new_document_types_not_conflated_with_reference_reasons(self):
        for doc in ["19", "20"]:
            self.assertEqual(self.check(xml(doc=doc))["errors"], [])
        self.assertIn("REFERENCE_CODE_UNKNOWN", self.check(xml(code="19"))["errors"])

    def test_unknown_disabled_and_non_two_digit_codes(self):
        self.assertIn("REFERENCE_TYPE_UNKNOWN_OR_DISABLED", self.check(xml(doc="09"))["errors"])
        self.assertIn("REFERENCE_CODE_UNKNOWN", self.check(xml(code="3"))["errors"])

    def test_scope_and_namespace_fail_closed(self):
        self.assertIn("ISSUER_SCOPE_MISMATCH", self.check(xml(), "OTHER")["errors"])
        self.assertIn("EXPECTED_ISSUER_REQUIRED", self.check(xml(), "")["errors"])
        self.assertIn("UNSUPPORTED_ROOT_OR_VERSION", self.check(xml().replace(b"v4.4", b"v4.3"))["errors"])

    def test_document_type_restrictions(self):
        self.assertIn("REP_REFERENCE_TYPE_UNSUPPORTED", self.check(xml("ReciboElectronicoPago", "17", "19"))["errors"])
        self.assertIn("REFERENCE_TYPE16_REQUIRES_PURCHASE_INVOICE", self.check(xml(doc="16"))["errors"])
        self.assertEqual(self.check(xml("FacturaElectronicaCompra", "11", "16"))["errors"], [])

    def test_duplicate_fields_and_missing_references(self):
        self.assertIn("REQUIRED_FIELD_OR_TIMESTAMP_INVALID", self.check(xml().replace(b"<x:Codigo>13</x:Codigo>", b"<x:Codigo>13</x:Codigo><x:Codigo>14</x:Codigo>"))["errors"])
        self.assertIn("NO_REFERENCE_CASE_TO_CHECK", self.check(xml().replace(b"x:InformacionReferencia", b"x:Other"))["errors"])

    def test_invalid_and_future_dates(self):
        self.assertIn("REQUIRED_FIELD_OR_TIMESTAMP_INVALID", self.check(xml(original="2026-02-30T00:00:00-06:00"))["errors"])
        self.assertIn("REQUIRED_FIELD_OR_TIMESTAMP_INVALID", self.check(xml(original="2026-09-30T23:30:00"))["errors"])
        self.assertIn("REFERENCE_IN_FUTURE", self.check(xml(original="2026-11-01T00:00:00-06:00"))["errors"])

    def test_other_codes_require_descriptions(self):
        self.assertEqual(self.check(xml(code="99"))["status"], "BLOCKED")
        self.assertEqual(self.check(xml(doc="99"))["status"], "BLOCKED")

    def test_hostile_input_and_bounds(self):
        for raw in [b"<!DOCTYPE x [<!ENTITY leak SYSTEM 'file:///etc/passwd'>]><x/>", b"not xml", b"x" * (ce44.LIMIT + 1), xml().decode().encode("utf-16")]:
            self.assertEqual(self.check(raw)["status"], "BLOCKED")

    def test_reports_never_return_document_data_or_acceptance(self):
        output = json.dumps(self.check(xml()))
        for private in ["SYNTHETIC-01", "synthetic reason", "1" * 50]:
            self.assertNotIn(private, output)
        self.assertEqual(self.check(xml())["haciendaAcceptance"], "NOT_VERIFIED")


if __name__ == "__main__":
    unittest.main()
