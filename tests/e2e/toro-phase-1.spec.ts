import { expect, test, type Page } from "@playwright/test";

const baseURL = process.env.TORO_E2E_BASE_URL;
const founderEmail = process.env.TORO_E2E_FOUNDER_EMAIL;
const founderPassword = process.env.TORO_E2E_FOUNDER_PASSWORD;
const restrictedEmail = process.env.TORO_E2E_RESTRICTED_EMAIL;
const restrictedPassword = process.env.TORO_E2E_RESTRICTED_PASSWORD;
const mutationDecisionTitle = process.env.TORO_E2E_DECISION_TITLE;
const mutationEnabled = process.env.TORO_E2E_MUTATION_ENABLED === "true";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login?next=/toro");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar a TORO" }).click();
  await expect(page).toHaveURL(/\/toro(?:\?|$)/);
}

test.describe("TORO Phase 1 founder critical path", () => {
  test.skip(
    !baseURL || !founderEmail || !founderPassword,
    "Requires TORO_E2E_BASE_URL and dedicated Founder E2E credentials.",
  );

  test.beforeEach(async ({ page }) => {
    await login(page, founderEmail!, founderPassword!);
  });

  test("mobile Executive Home renders the five executive sections and max five decisions", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Necesita mi decisión" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qué está mal hoy" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qué avanza sin mí" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mis proyectos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Acciones rápidas" })).toBeVisible();
    await expect(page.getByTestId("executive-decision-card")).toHaveCount(
      Math.min(await page.getByTestId("executive-decision-card").count(), 5),
    );
    expect(await page.getByTestId("executive-decision-card").count()).toBeLessThanOrEqual(5);
  });

  test("opens decisions, searches governed content and logs out", async ({ page }) => {
    await page.getByRole("link", { name: "Ver todas las decisiones" }).click();
    await expect(page).toHaveURL(/\/toro\/decisiones/);
    await expect(page.getByRole("heading", { name: "Decisiones" })).toBeVisible();

    await page.getByRole("button", { name: "Buscar" }).click();
    await page.getByLabel("Buscar en TORO").fill("25");
    await page.getByRole("button", { name: "Ir" }).click();
    await expect(page).toHaveURL(/\/toro\/buscar\?q=25/);
    await expect(page.getByRole("heading", { name: "Buscar" })).toBeVisible();

    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("safe decision action is reachable within three taps on a development fixture", async ({ page }) => {
    test.skip(
      !mutationEnabled || !mutationDecisionTitle,
      "Mutation test requires a seeded development-only decision and TORO_E2E_MUTATION_ENABLED=true.",
    );

    await page.getByRole("link", { name: "Ver todas las decisiones" }).click(); // tap 1
    const card = page.getByRole("article").filter({ hasText: mutationDecisionTitle! }).first();
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Posponer" }).click(); // tap 2
    await expect(card.getByRole("status")).toContainText(/Acción registrada|Registrando acción/);
  });
});

test.describe("TORO Phase 1 restricted-role guard", () => {
  test.skip(
    !baseURL || !restrictedEmail || !restrictedPassword,
    "Requires dedicated restricted-role E2E credentials.",
  );

  test("restricted user cannot execute founder-only decision actions", async ({ page }) => {
    test.skip(
      !mutationEnabled,
      "Restricted-role mutation test requires TORO_E2E_MUTATION_ENABLED=true.",
    );

    await login(page, restrictedEmail!, restrictedPassword!);
    await page.goto("/toro/decisiones");

    const approve = page.getByRole("button", { name: "Aprobar" }).first();
    if (await approve.isVisible()) {
      page.once("dialog", (dialog) => dialog.accept());
      await approve.click();
      await expect(page.getByRole("status").first()).toContainText(/Founder approval required|No se pudo|permission/i);
    } else {
      await expect(page.getByText(/No tienes acceso|No hay decisiones/i)).toBeVisible();
    }
  });
});
