type RoomSummaryInput = {
  key?: string;
  number?: string;
  name?: string;
  status?: string;
  property?: string;
  capacity?: number | null;
  beds?: string;
  kitchen?: string;
  projector?: boolean;
  floor?: string;
  amenities?: unknown[];
  [key: string]: unknown;
};

type SellableUnitInput = {
  key?: string;
  name?: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
};

type KrossInput = {
  referenceKey?: string;
  directBookingUrl?: string;
  syncStatus?: string;
  [key: string]: unknown;
};

type MediaInput = {
  key?: string;
  name?: string;
  role?: string;
  publicUrl?: string;
  approved?: boolean;
  roomKeys?: string[];
  [key: string]: unknown;
};

type TaskInput = {
  key?: string;
  title?: string;
  status?: string;
  priority?: string;
  linkedEntityKey?: string;
  [key: string]: unknown;
};

type ValidationInput = {
  key?: string;
  title?: string;
  status?: string;
  severity?: string;
  linkedEntityKey?: string;
  [key: string]: unknown;
};

type KnowledgeInput = {
  key?: string;
  title?: string;
  status?: string;
  linkedEntityKeys?: string[];
  [key: string]: unknown;
};

export type Room360Input = {
  room?: RoomSummaryInput;
  sellableUnits?: SellableUnitInput[];
  kross?: KrossInput;
  media?: MediaInput[];
  tasks?: TaskInput[];
  validations?: ValidationInput[];
  knowledge?: KnowledgeInput[];
};

export type Room360Media = {
  key: string;
  name: string;
  publicUrl: string;
  approved: boolean;
  identityScope: "exact" | "shared";
  sharedWith: string[];
};

export type Room360View = {
  summary: {
    key: string;
    number: string;
    name: string;
    status: string;
    property: string;
    capacity: number | null;
    beds: string;
    kitchen: string;
    projector: boolean;
    floor: string;
    amenityCount: number;
  };
  sale: Array<{ key: string; name: string; type: string; status: string }>;
  kross: {
    authority: "Kross";
    referenceKey: string;
    directBookingUrl: string;
    syncStatus: string;
  };
  media: {
    hero: Room360Media[];
    web: Room360Media[];
    kross: Room360Media[];
    pending: Room360Media[];
  };
  operation: {
    tasks: Array<{ key: string; title: string; status: string; priority: string }>;
    validations: Array<{ key: string; title: string; status: string; severity: string }>;
  };
  knowledge: Array<{ key: string; title: string; status: string }>;
};

function projectUnit(unit: SellableUnitInput) {
  return {
    key: unit.key ?? "",
    name: unit.name ?? "",
    type: unit.type ?? "",
    status: unit.status ?? "",
  };
}

function projectMedia(asset: MediaInput, roomKey: string): Room360Media {
  const linkedRooms = Array.isArray(asset.roomKeys) ? asset.roomKeys : [];
  const sharedWith = linkedRooms.filter((key) => key && key !== roomKey);

  return {
    key: asset.key ?? "",
    name: asset.name ?? "",
    publicUrl: asset.publicUrl ?? "",
    approved: Boolean(asset.approved),
    identityScope: sharedWith.length ? "shared" : "exact",
    sharedWith,
  };
}

function projectTask(task: TaskInput) {
  return {
    key: task.key ?? "",
    title: task.title ?? "",
    status: task.status ?? "",
    priority: task.priority ?? "",
  };
}

function projectValidation(validation: ValidationInput) {
  return {
    key: validation.key ?? "",
    title: validation.title ?? "",
    status: validation.status ?? "",
    severity: validation.severity ?? "",
  };
}

function projectKnowledge(item: KnowledgeInput) {
  return {
    key: item.key ?? "",
    title: item.title ?? "",
    status: item.status ?? "",
  };
}

function uniqueByKey<T extends { key?: string }>(items: T[] = []) {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const item of items) {
    if (!item.key || seen.has(item.key)) continue;
    seen.add(item.key);
    output.push(item);
  }

  return output;
}

function mediaBuckets(media: MediaInput[] = [], roomKey = "") {
  const buckets: Room360View["media"] = { hero: [], web: [], kross: [], pending: [] };

  for (const asset of media) {
    const projected = projectMedia(asset, roomKey);
    if (asset.role === "hero") buckets.hero.push(projected);
    else if (asset.role === "web") buckets.web.push(projected);
    else if (asset.role === "kross") buckets.kross.push(projected);
    else buckets.pending.push(projected);
  }

  return buckets;
}

function hasExactEntityLink(item: { linkedEntityKey?: string }, roomKey: string) {
  return item.linkedEntityKey === roomKey;
}

function hasKnowledgeLink(item: KnowledgeInput, roomKey: string) {
  return Array.isArray(item.linkedEntityKeys) && item.linkedEntityKeys.includes(roomKey);
}

export function buildRoom360(input: Room360Input = {}): Room360View {
  const room = input.room ?? {};
  const roomKey = room.key ?? "";

  return {
    summary: {
      key: roomKey,
      number: room.number ?? "",
      name: room.name ?? "",
      status: room.status ?? "",
      property: room.property ?? "",
      capacity: typeof room.capacity === "number" ? room.capacity : null,
      beds: room.beds ?? "",
      kitchen: room.kitchen ?? "",
      projector: Boolean(room.projector),
      floor: room.floor ?? "",
      amenityCount: Array.isArray(room.amenities) ? room.amenities.length : 0,
    },
    sale: uniqueByKey(input.sellableUnits).map(projectUnit),
    kross: {
      authority: "Kross",
      referenceKey: input.kross?.referenceKey ?? "",
      directBookingUrl: input.kross?.directBookingUrl ?? "",
      syncStatus: input.kross?.syncStatus ?? "",
    },
    media: mediaBuckets(input.media, roomKey),
    operation: {
      tasks: uniqueByKey((input.tasks ?? []).filter((item) => hasExactEntityLink(item, roomKey))).map(projectTask),
      validations: uniqueByKey(
        (input.validations ?? []).filter((item) => hasExactEntityLink(item, roomKey)),
      ).map(projectValidation),
    },
    knowledge: uniqueByKey((input.knowledge ?? []).filter((item) => hasKnowledgeLink(item, roomKey))).map(
      projectKnowledge,
    ),
  };
}
