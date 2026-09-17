import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "@/features/auth/role-nav";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

describe.each([
  ["desktop", DesktopNav, "Navegación principal"],
  ["mobile", MobileNav, "Navegación móvil"],
] as const)("%s navigation", (_viewport, Navigation, accessibleName) => {
  it("renders real modules as links and future modules as non-focusable unavailable items", () => {
    render(<Navigation items={getRoleNavigation("FOUNDER")} />);
    const navigation = within(screen.getByRole("navigation", { name: accessibleName }));

    expect(navigation.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/toro");
    expect(navigation.getByRole("link", { name: "Decisiones" })).toHaveAttribute("href", "/toro/decisiones");
    expect(navigation.getByRole("link", { name: "Proyectos" })).toHaveAttribute("href", "/toro/proyectos");
    expect(navigation.getAllByRole("link")).toHaveLength(3);

    const unavailableHotel = navigation.getByText("Hotel").closest("[aria-disabled='true']");
    expect(unavailableHotel).toBeInTheDocument();
    expect(unavailableHotel).not.toHaveAttribute("tabindex");
    expect(navigation.getAllByText("Próximamente").length).toBeGreaterThan(0);
  });
});
