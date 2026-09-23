import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, refresh, replace, signOutMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, replace }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getSession: getSessionMock, signOut: signOutMock },
  }),
}));

import { SignOutButton } from "./sign-out-button";

describe("SignOutButton synthetic provider outcomes", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    refresh.mockReset();
    replace.mockReset();
    signOutMock.mockReset();
  });

  it("waits for successful sign-out, then redirects and refreshes", async () => {
    let resolveSignOut: ((value: { error: null }) => void) | undefined;
    signOutMock.mockReturnValue(
      new Promise<{ error: null }>((resolve) => {
        resolveSignOut = resolve;
      }),
    );
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(screen.getByRole("button", { name: "Saliendo…" })).toBeDisabled();
    expect(replace).not.toHaveBeenCalled();

    resolveSignOut?.({ error: null });

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(getSessionMock).not.toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledWith();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Salir" })).toBeEnabled();
  });

  it("does not claim logout or redirect when Supabase returns an error", async () => {
    signOutMock.mockResolvedValue({
      error: { message: "synthetic sign-out failure" },
    });
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salir" })).toBeEnabled(),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No pudimos confirmar el cierre de todas las sesiones. Inténtalo de nuevo.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "synthetic sign-out failure",
    );
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the same generic accessible error when sign-out throws", async () => {
    signOutMock.mockRejectedValue(new Error("private provider details"));
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos confirmar el cierre de todas las sesiones. Inténtalo de nuevo.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "private provider details",
    );
    expect(screen.getByRole("button", { name: "Salir" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("rechecks an existing local session on retry and navigates only after sign-out succeeds", async () => {
    let resolveRetry: ((value: { error: null }) => void) | undefined;
    getSessionMock.mockResolvedValue({
      data: { session: {} },
      error: null,
    });
    signOutMock
      .mockResolvedValueOnce({ error: { message: "first failure" } })
      .mockReturnValueOnce(
        new Promise<{ error: null }>((resolve) => {
          resolveRetry = resolve;
        }),
      );
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    await screen.findByRole("alert");

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Saliendo…" })).toBeDisabled();
    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();

    resolveRetry?.({ error: null });

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(2);
  });

  it("does not treat a retry without a local session as confirmed global sign-out", async () => {
    let localSessionExists = true;
    getSessionMock.mockImplementation(async () => ({
      data: { session: localSessionExists ? {} : null },
      error: null,
    }));
    signOutMock.mockImplementation(async () => {
      localSessionExists = false;
      return { error: { message: "provider failed after local removal" } };
    });
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    await screen.findByRole("alert");

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(await screen.findByRole("link", { name: "Iniciar sesión de nuevo" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No pudimos confirmar el cierre de todas las sesiones.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "provider failed after local removal",
    );
    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("fails closed when the retry session preflight returns an error", async () => {
    signOutMock.mockResolvedValueOnce({ error: { message: "first failure" } });
    getSessionMock.mockResolvedValueOnce({
      data: { session: null },
      error: { message: "private preflight error" },
    });
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(await screen.findByRole("link", { name: "Iniciar sesión de nuevo" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("private preflight error");
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("fails closed when the retry session preflight throws", async () => {
    signOutMock.mockResolvedValueOnce({ error: { message: "first failure" } });
    getSessionMock.mockRejectedValueOnce(new Error("private preflight exception"));
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(await screen.findByRole("link", { name: "Iniciar sesión de nuevo" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "private preflight exception",
    );
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("ignores duplicate clicks while a sign-out request is pending", () => {
    signOutMock.mockReturnValue(new Promise(() => undefined));
    render(<SignOutButton />);

    const button = screen.getByRole("button", { name: "Salir" });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Saliendo…" }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Saliendo…" })).toBeDisabled();
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
