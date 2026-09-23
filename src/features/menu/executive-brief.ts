export type ExecutiveBriefRecord = Record<string, unknown>;

export type ExecutiveBriefItem = {
  title: string;
  meta?: string;
  detail?: string;
};

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildExecutiveBriefItems({
  decisions,
  projects,
  tasks,
}: {
  decisions: ExecutiveBriefRecord[];
  projects: ExecutiveBriefRecord[];
  tasks: ExecutiveBriefRecord[];
}): ExecutiveBriefItem[] {
  const decisionItems = decisions
    .filter((row) => {
      const status = (cleanText(row.status) ?? "").toLowerCase();
      return !["processed", "respondida", "superseded"].includes(status);
    })
    .slice(0, 2)
    .map((row) => ({
      title: cleanText(row.decision_title) ?? "Decisión",
      meta: ["Decisión", cleanText(row.status), cleanText(row.priority)]
        .filter(Boolean)
        .join(" · "),
      detail: cleanText(row.next_action) ?? undefined,
    }));

  const projectItems = projects.slice(0, 2).map((row) => {
    const completion = cleanNumber(row.completion_pct);
    return {
      title: cleanText(row.project_name) ?? "Proyecto",
      meta: [
        "Proyecto",
        cleanText(row.status),
        cleanText(row.priority),
        completion === null ? null : `${completion}%`,
      ]
        .filter(Boolean)
        .join(" · "),
      detail: cleanText(row.next_action) ?? undefined,
    };
  });

  const taskItems = tasks
    .filter((row) => {
      const status = (cleanText(row.status) ?? "").toLowerCase();
      const priority = (cleanText(row.priority) ?? "").toLowerCase();
      return (
        status === "in_progress" ||
        (status === "blocked" && ["critical", "p0"].includes(priority))
      );
    })
    .slice(0, 3)
    .map((row) => {
      const due = cleanText(row.due_date);
      return {
        title: cleanText(row.task_name) ?? "Tarea",
        meta: [
          "Tarea",
          cleanText(row.status),
          cleanText(row.priority),
          due ? `vence ${due}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        detail: cleanText(row.next_action) ?? undefined,
      };
    });

  return [...decisionItems, ...projectItems, ...taskItems].slice(0, 7);
}
