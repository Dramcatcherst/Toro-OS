import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { resolveToroContext } from "@/features/context/resolver";
import { createWorkerSupabaseClient } from "@/lib/supabase/worker";

const EVENT_KEY = "los50s-caro-2026";

export type Los50sOpsSummary = {
  registrations: number;
  activeParticipants: number;
  provisionalParticipants: number;
  leaders: number;
  directCount: number;
  manuelAntonioCount: number;
  undecidedCount: number;
  roomsConfirmed: number;
  roomAssignmentsPending: number;
  transportLegsPlanned: number;
  transportLegsConfirmed: number;
  chargesUsd: number;
  creditsUsd: number;
  groupFundInUsd: number;
  groupFundSpentUsd: number;
};

export type Los50sOpsParticipant = {
  ref: string;
  name: string;
  role: string | null;
  leader: boolean;
  phone: string | null;
  ageBand: string | null;
  route: string | null;
  usesBed: boolean;
  bedPreference: string | null;
  accommodationPreference: string | null;
  foodPreference: string | null;
  foodDislikes: string | null;
  allergies: string | null;
  luggageCount: number;
  specialLuggage: string | null;
  status: string;
};

export type Los50sOpsRoom = {
  ref: string;
  roomCode: string | null;
  bedLabel: string | null;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  notes: string | null;
  preferredBed: string | null;
  preferredAccommodation: string | null;
};

export type Los50sOpsTransport = {
  ref: string;
  leg: string;
  route: string | null;
  travelDate: string | null;
  pickupTime: string | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  vehicleRef: string | null;
  driverRef: string | null;
  status: string;
  luggageCount: number;
  specialLuggage: string | null;
};

export type Los50sEventOpsView =
  | { state: "unauthenticated" }
  | { state: "forbidden"; actor: string }
  | { state: "unavailable"; error: string }
  | {
      state: "ready";
      actor: string;
      orgId: string;
      summary: Los50sOpsSummary;
      participants: Los50sOpsParticipant[];
      rooms: Los50sOpsRoom[];
      transport: Los50sOpsTransport[];
    };

export function canReadLos50sEventOps(context: ToroResolvedContext) {
  if (
    context.mode !== "organization" ||
    !context.orgId ||
    !context.membership ||
    !context.canUseOrganizationData ||
    context.requiresContextChoice
  ) {
    return false;
  }

  return context.membership.roles.some(
    (role) => role === "ADMIN" || role === "GERENCIA",
  );
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return 0;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function loadLos50sEventOps(): Promise<Los50sEventOpsView> {
  let context: ToroResolvedContext | null;

  try {
    context = await resolveToroContext({ mode: "organization" });
  } catch {
    return { state: "unavailable", error: "Organization context could not be resolved safely." };
  }

  if (!context) return { state: "unauthenticated" };
  if (!canReadLos50sEventOps(context)) {
    return { state: "forbidden", actor: context.displayName };
  }

  let worker;
  try {
    worker = createWorkerSupabaseClient();
  } catch {
    return { state: "unavailable", error: "Event Ops backend credential is unavailable." };
  }

  const [summaryResult, participantResult, roomResult, transportResult] = await Promise.all([
    worker
      .from("los50s_ops_dashboard")
      .select("*")
      .eq("org_id", context.orgId!)
      .eq("event_key", EVENT_KEY)
      .maybeSingle(),
    worker
      .from("los50s_participant_ops")
      .select(
        "participant_ref,display_name,group_role,is_group_leader,phone,age_band,route_choice,uses_bed,bed_preference,accommodation_preference,food_preference,food_dislikes,allergies,luggage_count,special_luggage,participant_status",
      )
      .eq("org_id", context.orgId!)
      .eq("event_key", EVENT_KEY)
      .neq("participant_status", "cancelled")
      .order("is_group_leader", { ascending: false })
      .order("display_name", { ascending: true }),
    worker
      .from("los50s_room_assignments")
      .select("participant_ref,room_code,bed_label,assignment_status,check_in,check_out,accommodation_notes,preferred_bed,preferred_accommodation")
      .eq("org_id", context.orgId!)
      .eq("event_key", EVENT_KEY)
      .order("assignment_status", { ascending: true })
      .order("participant_ref", { ascending: true }),
    worker
      .from("los50s_transport_manifest")
      .select("participant_ref,leg,route_choice,travel_date,pickup_time,pickup_location,dropoff_location,vehicle_ref,driver_ref,status,luggage_count,special_luggage")
      .eq("org_id", context.orgId!)
      .eq("event_key", EVENT_KEY)
      .order("travel_date", { ascending: true })
      .order("leg", { ascending: true })
      .order("participant_ref", { ascending: true }),
  ]);

  if (summaryResult.error || participantResult.error || roomResult.error || transportResult.error) {
    return { state: "unavailable", error: "Event Ops read failed safely." };
  }

  const row = summaryResult.data as Record<string, unknown> | null;
  const summary: Los50sOpsSummary = {
    registrations: numberValue(row?.registrations),
    activeParticipants: numberValue(row?.active_participants),
    provisionalParticipants: numberValue(row?.provisional_participants),
    leaders: numberValue(row?.leaders),
    directCount: numberValue(row?.direct_count),
    manuelAntonioCount: numberValue(row?.manuel_antonio_count),
    undecidedCount: numberValue(row?.undecided_count),
    roomsConfirmed: numberValue(row?.rooms_confirmed),
    roomAssignmentsPending: numberValue(row?.room_assignments_pending),
    transportLegsPlanned: numberValue(row?.transport_legs_planned),
    transportLegsConfirmed: numberValue(row?.transport_legs_confirmed),
    chargesUsd: numberValue(row?.charges_usd),
    creditsUsd: numberValue(row?.credits_usd),
    groupFundInUsd: numberValue(row?.group_fund_in_usd),
    groupFundSpentUsd: numberValue(row?.group_fund_spent_usd),
  };

  const participants = (participantResult.data ?? []).flatMap((candidate) => {
    const item = candidate as Record<string, unknown>;
    const ref = textOrNull(item.participant_ref);
    const name = textOrNull(item.display_name);
    if (!ref || !name) return [];

    return [{
      ref,
      name,
      role: textOrNull(item.group_role),
      leader: item.is_group_leader === true,
      phone: textOrNull(item.phone),
      ageBand: textOrNull(item.age_band),
      route: textOrNull(item.route_choice),
      usesBed: item.uses_bed !== false,
      bedPreference: textOrNull(item.bed_preference),
      accommodationPreference: textOrNull(item.accommodation_preference),
      foodPreference: textOrNull(item.food_preference),
      foodDislikes: textOrNull(item.food_dislikes),
      allergies: textOrNull(item.allergies),
      luggageCount: numberValue(item.luggage_count),
      specialLuggage: textOrNull(item.special_luggage),
      status: textOrNull(item.participant_status) ?? "active",
    }];
  });

  const rooms = (roomResult.data ?? []).flatMap((candidate) => {
    const item = candidate as Record<string, unknown>;
    const ref = textOrNull(item.participant_ref);
    if (!ref) return [];

    return [{
      ref,
      roomCode: textOrNull(item.room_code),
      bedLabel: textOrNull(item.bed_label),
      status: textOrNull(item.assignment_status) ?? "unassigned",
      checkIn: textOrNull(item.check_in),
      checkOut: textOrNull(item.check_out),
      notes: textOrNull(item.accommodation_notes),
      preferredBed: textOrNull(item.preferred_bed),
      preferredAccommodation: textOrNull(item.preferred_accommodation),
    }];
  });

  const transport = (transportResult.data ?? []).flatMap((candidate) => {
    const item = candidate as Record<string, unknown>;
    const ref = textOrNull(item.participant_ref);
    const leg = textOrNull(item.leg);
    if (!ref || !leg) return [];

    return [{
      ref,
      leg,
      route: textOrNull(item.route_choice),
      travelDate: textOrNull(item.travel_date),
      pickupTime: textOrNull(item.pickup_time),
      pickupLocation: textOrNull(item.pickup_location),
      dropoffLocation: textOrNull(item.dropoff_location),
      vehicleRef: textOrNull(item.vehicle_ref),
      driverRef: textOrNull(item.driver_ref),
      status: textOrNull(item.status) ?? "planned",
      luggageCount: numberValue(item.luggage_count),
      specialLuggage: textOrNull(item.special_luggage),
    }];
  });

  return {
    state: "ready",
    actor: context.displayName,
    orgId: context.orgId!,
    summary,
    participants,
    rooms,
    transport,
  };
}
