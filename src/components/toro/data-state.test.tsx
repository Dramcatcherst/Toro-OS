import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataState } from "./data-state";

describe("DataState", () => {
  it.each([
    ["loading", "Cargando información"],
    ["empty", "No hay información para mostrar"],
    ["forbidden", "No tienes acceso a esta información"],
    ["error", "No pudimos cargar esta información"],
  ] as const)("renders human-readable Spanish copy for %s", (variant, text) => {
    render(<DataState variant={variant} />);
    expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(/stack|trace|exception/i)).not.toBeInTheDocument();
  });

  it("shows source and freshness explicitly for stale data", () => {
    render(
      <DataState
        variant="stale"
        source="Supabase · Kross sync"
        freshness="Hace 42 min"
      />,
    );

    expect(screen.getByText(/información desactualizada/i)).toBeInTheDocument();
    expect(screen.getByText(/supabase · kross sync/i)).toBeInTheDocument();
    expect(screen.getByText(/hace 42 min/i)).toBeInTheDocument();
  });

  it("offers a retry affordance for recoverable states", () => {
    const retry = vi.fn();
    render(<DataState variant="error" onRetry={retry} />);
    const button = screen.getByRole("button", { name: /intentar de nuevo/i });
    button.click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
