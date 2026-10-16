import hashlib
import json
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from openpyxl import Workbook

from scripts.kross_xlsx_to_private_snapshot import (
    build_snapshot,
    encode_snapshot,
    load_base,
    main,
    strict_source_as_of,
)


HEADERS = [
    "Number",
    "Name",
    "Rooms",
    "Guests",
    "Arrival",
    "Departure",
    "Channel",
    "Status",
    "Total",
]


class KrossXlsxSnapshotTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.xlsx = self.root / "kross.xlsx"
        workbook = Workbook()
        sheet = workbook.active
        sheet.append(HEADERS)
        sheet.append(["1001/2026", "Guest One", "#2, #5", 3, datetime(2026, 10, 14), datetime(2026, 10, 17), "Booking", "Check-in", 300])
        sheet.append(["1002/2026", "Guest Two", "VILLA TORO", 2, datetime(2026, 11, 1), datetime(2026, 11, 3), None, "Pendiente de Pago", 0])
        sheet.append(["1003/2026", "Guest Three", "#3", 1, datetime(2026, 11, 1), datetime(2026, 11, 3), "Booking", "Cancelada", 100])
        sheet.append(["1004/2026", "Guest Four", "#4", 1, datetime(2026, 10, 1), datetime(2026, 10, 2), "Booking", "Check-out", 100])
        workbook.save(self.xlsx)
        self.base = self.root / "base.json"
        self.operations = {"capturedAt": "2026-09-20T20:08:18Z", "days": []}
        self.base.write_text(
            json.dumps(
                {
                    "orgId": "org",
                    "propertyId": "property",
                    "source": "old",
                    "exportedAt": "2026-09-20T23:51:24Z",
                    "sourceIsLive": False,
                    "reservations": [{}],
                    "operations": self.operations,
                }
            ),
            encoding="utf-8",
        )
        self.source_as_of = "2026-10-15T10:11:14-06:00"

    def tearDown(self):
        self.temp.cleanup()

    def test_selects_ongoing_and_future_active_only(self):
        snapshot, report = build_snapshot(
            self.xlsx,
            load_base(self.base),
            cutoff_date=datetime(2026, 10, 16).date(),
            source_as_of=self.source_as_of,
            source_hash="a" * 64,
        )
        self.assertEqual([row["reservationId"] for row in snapshot["reservations"]], ["1001", "1002"])
        self.assertEqual(report["selectedReservations"], 2)
        self.assertEqual(snapshot["operations"], self.operations)
        self.assertFalse(snapshot["sourceIsLive"])

    def test_preserves_exact_source_id_and_unknown_fields(self):
        snapshot, _ = build_snapshot(
            self.xlsx,
            load_base(self.base),
            cutoff_date=datetime(2026, 10, 16).date(),
            source_as_of=self.source_as_of,
            source_hash="a" * 64,
        )
        row = snapshot["reservations"][0]
        self.assertEqual(row["details"]["sourceReservationId"], "1001/2026")
        self.assertEqual(row["details"]["rooms"], [{"room": "#2"}, {"room": "#5"}])
        self.assertIsNone(row["currency"])
        self.assertIsNone(row["amountPaid"])
        self.assertIsNone(row["paymentStatus"])
        self.assertIsNone(row["breakfastIncluded"])

    def test_main_rejects_changed_source_hash_without_writing(self):
        output = self.root / "candidate.json"
        output.touch()
        with self.assertRaisesRegex(ValueError, "SHA-256"):
            main(
                [
                    "--input",
                    str(self.xlsx),
                    "--base-snapshot",
                    str(self.base),
                    "--output",
                    str(output),
                    "--cutoff-date",
                    "2026-10-16",
                    "--source-as-of",
                    self.source_as_of,
                    "--expected-sha256",
                    "0" * 64,
                ]
            )
        self.assertEqual(output.stat().st_size, 0)

    def test_encoded_snapshot_fits_contract(self):
        snapshot, _ = build_snapshot(
            self.xlsx,
            load_base(self.base),
            cutoff_date=datetime(2026, 10, 16).date(),
            source_as_of=strict_source_as_of(self.source_as_of),
            source_hash=hashlib.sha256(self.xlsx.read_bytes()).hexdigest(),
        )
        self.assertLessEqual(len(encode_snapshot(snapshot)), 524_288)


if __name__ == "__main__":
    unittest.main()
