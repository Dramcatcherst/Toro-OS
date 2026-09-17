import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "@/features/auth/role-nav";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

const availableFounderLinks = [
  ["Inicio", "/toro"],
  ["Decisiones", "/toro/decisiones"],
  ["Hotel", "/toro/hotel"],
  ["Proyectos", "/toro/proyectos"],
  ["Conocimiento", "/toro/conocimiento"],
] as const;

describe("desktop navigation", () => {
  it("renders implemented modules as links and future modules as unavailable items", () => {
    render(<DesktopNav items={getRoleNavigation("FOUNDER")} />);
    const navigation = within(screen.getByRole("navigation", { name: "Navegación principal" }));

    for (const [label, href] of availableFounderLinks) {
      expect(navigation.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(navigation.getAllByRole("link")).toHaveLength(5);

    const unavailableGuests = navigation.getByText("Huéspedes").closest("[aria-disabled='true']");
    expect(unavailableGuests).toBeInTheDocument();
    expect(unavailableGuests).not.toHaveAttribute("tabindex");
    expect(navigation.getAllByText("Próximamente").length).toBeGreaterThan(0);
  });
});

describe("mobile navigation", () => {
  it("prioritizes the five implemented founder modules before future placeholders", () => {
    render(<MobileNav items={getRoleNavigation("FOUNDER")} />);
    const navigation = within(screen.getByRole("navigation", { name: "Navegación móvil" }));

    for (const [label, href] of availableFounderLinks) {
      expect(navigation.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(navigation.getAllByRole("link")).toHaveLength(5);
    expect(navigation.queryByText("Próximamente")).not.toBeInTheDocument();
  });
});
