const GROUPS = {
  room: { order: 10, label: "Habitaciones" },
  villa: { order: 20, label: "Propiedades y villas" },
  property: { order: 20, label: "Propiedades y villas" },
  sellable_unit: { order: 25, label: "Propiedades y villas" },
  staff: { order: 30, label: "Personas" },
  task: { order: 40, label: "Operación" },
  validation: { order: 40, label: "Operación" },
  sop: { order: 50, label: "Conocimiento" },
  experience: { order: 60, label: "Experiencias" },
  amenity: { order: 65, label: "Conocimiento" },
  source: { order: 70, label: "Sistemas" },
};

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenScore(query, candidateText) {
  const queryTokens = query.split(" ").filter(Boolean);
  if (!queryTokens.length) return 0;

  const matched = queryTokens.filter((token) => candidateText.includes(token)).length;
  if (!matched) return 0;

  return Math.round((matched / queryTokens.length) * 100);
}

function classify(query, candidate) {
  const key = normalize(candidate.key);
  const title = normalize(candidate.title);
  const aliases = (candidate.aliases ?? []).map(normalize).filter(Boolean);
  const subtitle = normalize(candidate.subtitle);
  const searchText = normalize(candidate.searchText);

  if (key === query) return { score: 600, matchType: "exact-key" };
  if (title === query) return { score: 550, matchType: "exact-title" };
  if (aliases.includes(query)) return { score: 525, matchType: "exact-alias" };

  if (key.startsWith(query) || title.startsWith(query) || aliases.some((alias) => alias.startsWith(query))) {
    return { score: 400, matchType: "prefix" };
  }

  const combined = [key, title, ...aliases, subtitle, searchText].filter(Boolean).join(" ");
  const fuzzy = tokenScore(query, combined);
  if (!fuzzy) return null;

  return { score: 100 + fuzzy, matchType: "fuzzy" };
}

function project(candidate, match) {
  return {
    entityType: candidate.entityType,
    key: candidate.key,
    title: candidate.title,
    subtitle: candidate.subtitle ?? "",
    status: candidate.status ?? "",
    destination: candidate.destination ?? "",
    source: candidate.source ?? "",
    matchType: match.matchType,
    score: match.score,
  };
}

export function rankSearchResults(query, candidates = []) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  return candidates
    .map((candidate, index) => {
      const match = classify(normalizedQuery, candidate);
      return match ? { result: project(candidate, match), index } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.result.score - a.result.score || a.index - b.index)
    .map(({ result }) => result);
}

export function groupSearchResults(results = []) {
  const grouped = new Map();

  for (const result of results) {
    const config = GROUPS[result.entityType] ?? { order: 999, label: "Otros" };
    const existing = grouped.get(config.label) ?? { label: config.label, order: config.order, results: [] };
    existing.results.push(result);
    grouped.set(config.label, existing);
  }

  return [...grouped.values()]
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "es"))
    .map(({ label, results: groupResults }) => ({ label, results: groupResults }));
}
