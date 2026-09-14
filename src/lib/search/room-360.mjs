function projectUnit(unit) {
  return {
    key: unit.key,
    name: unit.name,
    type: unit.type ?? "",
    status: unit.status ?? "",
  };
}

function projectMedia(asset) {
  return {
    key: asset.key,
    name: asset.name ?? "",
    publicUrl: asset.publicUrl ?? "",
    approved: Boolean(asset.approved),
  };
}

function projectTask(task) {
  return {
    key: task.key,
    title: task.title ?? "",
    status: task.status ?? "",
    priority: task.priority ?? "",
  };
}

function projectValidation(validation) {
  return {
    key: validation.key,
    title: validation.title ?? "",
    status: validation.status ?? "",
    severity: validation.severity ?? "",
  };
}

function projectKnowledge(item) {
  return {
    key: item.key,
    title: item.title ?? "",
    status: item.status ?? "",
  };
}

function uniqueByKey(items = []) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    if (!item?.key || seen.has(item.key)) continue;
    seen.add(item.key);
    output.push(item);
  }

  return output;
}

function mediaBuckets(media = []) {
  const buckets = { hero: [], web: [], kross: [], pending: [] };

  for (const asset of media) {
    const projected = projectMedia(asset);
    if (asset.role === "hero") buckets.hero.push(projected);
    else if (asset.role === "web") buckets.web.push(projected);
    else if (asset.role === "kross") buckets.kross.push(projected);
    else buckets.pending.push(projected);
  }

  return buckets;
}

function hasExactEntityLink(item, roomKey) {
  return item?.linkedEntityKey === roomKey;
}

function hasKnowledgeLink(item, roomKey) {
  return Array.isArray(item?.linkedEntityKeys) && item.linkedEntityKeys.includes(roomKey);
}

export function buildRoom360(input = {}) {
  const room = input.room ?? {};
  const roomKey = room.key ?? "";

  return {
    summary: {
      key: roomKey,
      number: room.number ?? "",
      name: room.name ?? "",
      status: room.status ?? "",
      property: room.property ?? "",
      capacity: room.capacity ?? null,
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
    media: mediaBuckets(input.media),
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
