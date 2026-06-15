import { connectors } from "@/lib/toro-data";

const krossConnector = connectors.find((connector) => connector.id === "kross");
const publicBookingUrl = process.env.KROSS_PUBLIC_BOOKING_URL ?? null;

export async function GET() {
  return Response.json({
    connector: "kross",
    mode: "readiness_only",
    externalWrite: false,
    configured: Boolean(publicBookingUrl),
    publicBookingUrl,
    authority: krossConnector?.authority ?? "Live prices, availability, reservations and restrictions",
    allowedActions: krossConnector?.allowedActions ?? ["observe", "analyze", "recommend"],
    blockedActions: [
      "create_reservation",
      "modify_reservation",
      "change_rates",
      "change_availability",
      "collect_payment",
      "cancel_reservation",
    ],
    conversionUse: publicBookingUrl
      ? "The public booking URL can be used as a direct-booking handoff after guests choose a path. Commercial facts still remain Kross-authoritative."
      : "Set KROSS_PUBLIC_BOOKING_URL when the approved public booking engine URL is ready for direct-booking handoff.",
    nextAction: krossConnector?.nextAction ?? "Validate live commercial facts in Kross before confirmation.",
  });
}
