import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "@/features/auth/role-nav";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

const founderDesktopLinks = [
  ["Inicio", "/toro"],
  ["Decisiones", "/toro/decisiones"],
  ["Mantenimiento", "/toro/operacion/mantenimiento"],
  ["Hotel", "/toro/hotel"],
  ["Proyectos", "/toro/proyectos"],
  ["Conocimiento", "/toro/conocimiento"],
  ["Sistemas", "/toro/sistemas"],
] as const;

const founderMobileLinks = founderDesktopLinks.slice(0, 5);

describe("desktop navigation", () => {
  it("renders implemented modules as links and future modules as unavailable items", () => {
    render(<DesktopNav items={getRoleNavigation("FOUNDER")} />);
    const navigation = within(screen.getByRole("navigation", { name: "Navegación principal" }));

    for (const [label, href] of founderDesktopLinks) {
      expect(navigation.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(navigation.getAllByRole("link")).toHaveLength(7);

    const unavailableGuests = navigation.getByText("Huéspedes").closest("[aria-disabled='true']");
    expect(unavailableGuests).toBeInTheDocument();
    expect(unavailableGuests).not.toHaveAttribute("tabindex");
    expect(navigation.getAllByText("Próximamente").length).toBeGreaterThan(0);
  });
});

describe("mobile navigation", () => {
  it("prioritizes the five primary implemented founder modules", () => {
    render(<MobileNav items={getRoleNavigation("FOUNDER")} />);
    const navigation = within(screen.getByRole("navigation", { name: "Navegación móvil" }));

    for (const [label, href] of founderMobileLinks) {
      expect(navigation.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(navigation.getAllByRole("link")).toHaveLength(5);
    expect(navigation.queryByRole("link", { name: "Sistemas" })).not.toBeInTheDocument();
    expect(navigation.queryByText("Próximamente")).not.toBeInTheDocument();
  });
});
