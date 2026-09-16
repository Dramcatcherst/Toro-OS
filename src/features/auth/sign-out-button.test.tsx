import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh, replace, signOutMock } = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, replace }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: signOutMock },
  }),
}));

import { SignOutButton } from "./sign-out-button";

describe("SignOutButton synthetic provider outcomes", () => {
  beforeEach(() => {
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
      "No pudimos cerrar la sesión. Inténtalo de nuevo.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "synthetic sign-out failure",
    );
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows the same generic accessible error when sign-out throws", async () => {
    signOutMock.mockRejectedValue(new Error("private provider details"));
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos cerrar la sesión. Inténtalo de nuevo.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "private provider details",
    );
    expect(screen.getByRole("button", { name: "Salir" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("clears an old error on retry and navigates only after the retry succeeds", async () => {
    let resolveRetry: ((value: { error: null }) => void) | undefined;
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
    expect(replace).not.toHaveBeenCalled();

    resolveRetry?.({ error: null });

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(2);
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
