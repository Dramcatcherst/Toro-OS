import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    replace.mockClear();
    refresh.mockClear();
  });

  it("keeps credentials editable and visibly contrasted on the light login card", () => {
    render(<LoginForm />);

    const email = screen.getByRole("textbox", { name: /correo/i });
    const password = screen.getByLabelText(/contraseña/i);

    fireEvent.change(email, { target: { value: "admin@dreamcatcherhotel.com" } });
    fireEvent.change(password, { target: { value: "test-only" } });

    expect(email).toHaveValue("admin@dreamcatcherhotel.com");
    expect(password).toHaveValue("test-only");
    expect(email).toHaveClass("text-neutral-950");
    expect(password).toHaveClass("text-neutral-950");
  });
});
