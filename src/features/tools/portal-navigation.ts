import { canReadHotelDirectory, type ToolLink } from "./directory";
import type { ToroResolvedContext } from "@/features/context/types";

/** Owner-approved navigation only. No provider data, new grant or shared session. */
export function portalNavigation(context: ToroResolvedContext | null): ToolLink[] {
  if (!canReadHotelDirectory(context)) return [];
  return [
    { id: "PORTAL-KROSS-DASHBOARD", label: "Kross · Dashboard", url: "https://dreamcatcherhotel.krossbooking.com/rct/v3/dashboard" },
    { id: "PORTAL-POS", label: "Kross POS", url: "https://dreamcatcherhotel.krossbooking.com/admin/pos" },
    { id: "PORTAL-WHATSAPP", label: "WhatsApp", url: "https://web.whatsapp.com/" },
    { id: "PORTAL-ALEGRA", label: "Alegra", url: "https://app.alegra.com/" },
    { id: "PORTAL-GMAIL", label: "Gmail", url: "https://mail.google.com/" },
    { id: "PORTAL-DRIVE", label: "Google Drive", url: "https://drive.google.com/" },
    { id: "PORTAL-HOME", label: "Google Home", url: "https://home.google.com/" },
  ];
}
