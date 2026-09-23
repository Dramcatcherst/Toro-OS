import { describe, expect, it } from "vitest";

import { buildExecutiveBriefItems } from "./executive-brief";

describe("buildExecutiveBriefItems", () => {
  it("keeps active decisions and filters processed/superseded noise", () => {
    const items = buildExecutiveBriefItems({
      decisions: [
        {
          decision_title: "Decisión activa",
          status: "En ejecución",
          priority: "P0",
          next_action: "Cerrar evidencia",
        },
        {
          decision_title: "Ya procesada",
          status: "processed",
          priority: "P0",
        },
        {
          decision_title: "Superseded",
          status: "Superseded",
          priority: "P1",
        },
      ],
      projects: [],
      tasks: [],
    });

    expect(items.map((item) => item.title)).toEqual(["Decisión activa"]);
  });

  it("caps the brief and prefers material task states", () => {
    const items = buildExecutiveBriefItems({
      decisions: [
        { decision_title: "D1", status: "En ejecución", priority: "P0" },
        { decision_title: "D2", status: "confirmed", priority: "P1" },
        { decision_title: "D3", status: "En ejecución", priority: "P1" },
      ],
      projects: [
        {
          project_name: "P1",
          status: "NOW",
          priority: "critical",
          completion_pct: 40,
        },
        {
          project_name: "P2",
          status: "BLOCKED",
          priority: "critical",
          completion_pct: 70,
        },
        {
          project_name: "P3",
          status: "NOW",
          priority: "high",
        },
      ],
      tasks: [
        { task_name: "T1", status: "blocked", priority: "critical" },
        { task_name: "T2", status: "in_progress", priority: "high" },
        { task_name: "T3", status: "planned", priority: "critical" },
        { task_name: "T4", status: "blocked", priority: "medium" },
        { task_name: "T5", status: "blocked", priority: "P0" },
        { task_name: "T6", status: "in_progress", priority: "P1" },
      ],
    });

    expect(items).toHaveLength(7);
    expect(items.map((item) => item.title)).toEqual([
      "D1",
      "D2",
      "P1",
      "P2",
      "T1",
      "T2",
      "T5",
    ]);
    expect(items.some((item) => item.title === "T3")).toBe(false);
    expect(items.some((item) => item.title === "T4")).toBe(false);
  });

  it("adds due date only when present", () => {
    const items = buildExecutiveBriefItems({
      decisions: [],
      projects: [],
      tasks: [
        {
          task_name: "Vencida",
          status: "in_progress",
          priority: "critical",
          due_date: "2026-09-23",
        },
      ],
    });

    expect(items[0]?.meta).toContain("vence 2026-09-23");
  });
});
