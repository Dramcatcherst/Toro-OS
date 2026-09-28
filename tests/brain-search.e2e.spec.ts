import { expect, test } from "playwright/test";

const brainUrl = process.env.BRAIN_E2E_URL ?? "http://localhost:3057/brain";

for (const scenario of [
  { surface: "desktop", viewport: { width: 1440, height: 900 }, query: "Reservations", nodeId: "node:revenue" },
  { surface: "mobile", viewport: { width: 390, height: 844 }, query: "CAPEX", nodeId: "node:capex-approval" },
] as const) {
  test.describe(`${scenario.surface} Brain search`, () => {
    test.use({ viewport: scenario.viewport });

    test("Enter reveals and focuses the first matching neuron", async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(brainUrl, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle("TORO Brain");
      await expect(page.getByText("reference simulation", { exact: false })).toBeVisible();

      const search = page.locator(`[data-brain-search="${scenario.surface}"] input`);
      await search.fill(scenario.query);
      await expect(page.locator(`[data-brain-search="${scenario.surface}"] [role="group"] button`)).toHaveCount(1);
      await search.press("Enter");

      const node = scenario.surface === "desktop"
        ? page.locator(`[data-brain-visible-node="${scenario.nodeId}"]`)
        : page.locator(`[data-brain-mobile-node="${scenario.nodeId}"]`);
      await expect(node).toBeVisible();
      if (scenario.surface === "desktop") {
        await expect(node).toBeFocused();
        await expect(node).toHaveClass(/nodeSelected/);
      } else {
        await expect(node.locator("summary")).toBeFocused();
        await expect(node).toHaveAttribute("data-selected", "true");
      }
      await expect(search).toHaveValue("");
      expect(pageErrors).toEqual([]);
    });
  });
}
