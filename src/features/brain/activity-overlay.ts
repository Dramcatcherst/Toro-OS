import type { BrainActivityState, BrainEvent, BrainExecutionState, BrainProjection } from "@/lib/brain-contracts";

export type BrainActivityPulse = {
  nodeId: string;
  eventId: string;
  state: Extract<BrainActivityState, "reading" | "analyzing" | "executing" | "verifying">;
  occurredAt: string;
};

const activeStates = new Set<BrainExecutionState>(["reading", "analyzing", "executing", "verifying"]);
const clientSafeClasses = new Set<BrainEvent["redactionClass"]>(["public_reference", "work_org"]);

// The server must permission-filter the projection first. This guard prevents
// stale, cross-scope, or terminal receipts from becoming visual activity.
export function selectCurrentBrainActivity(
  projection: BrainProjection,
  now: string,
  maxAgeMs: number,
): BrainActivityPulse[] {
  const currentTime = Date.parse(now);
  if (projection.synthetic || !Number.isFinite(currentTime) || !Number.isFinite(maxAgeMs) || maxAgeMs <= 0) return [];

  const nodes = new Map(projection.nodes.map((node) => [node.id, node]));
  const latestByRun = new Map<string, { event: BrainEvent; occurredAt: number }>();

  for (const event of projection.recentEvents ?? []) {
    const node = nodes.get(event.entityRef);
    const occurredAt = Date.parse(event.occurredAt);
    if (
      !node || event.scopeRef !== node.scopeRef || event.entityKind !== node.kind ||
      !event.eventId || !event.correlationId || !event.actorRef || !event.sourceSystem ||
      !clientSafeClasses.has(event.redactionClass) || !Number.isFinite(occurredAt) ||
      occurredAt > currentTime || currentTime - occurredAt > maxAgeMs
    ) continue;

    const key = `${event.entityRef}\u0000${event.correlationId}`;
    const previous = latestByRun.get(key);
    if (!previous || occurredAt > previous.occurredAt || (occurredAt === previous.occurredAt && event.eventId > previous.event.eventId)) {
      latestByRun.set(key, { event, occurredAt });
    }
  }

  const pulses = new Map<string, BrainActivityPulse>();
  for (const { event } of latestByRun.values()) {
    if (!activeStates.has(event.executionState) || event.evidenceRefs.length === 0) continue;
    const state = event.executionState as BrainActivityPulse["state"];
    const previous = pulses.get(event.entityRef);
    if (!previous || Date.parse(event.occurredAt) > Date.parse(previous.occurredAt)) {
      pulses.set(event.entityRef, { nodeId: event.entityRef, eventId: event.eventId, state, occurredAt: event.occurredAt });
    }
  }
  return [...pulses.values()];
}
