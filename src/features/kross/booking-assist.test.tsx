import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KrossBookingAssist } from "./booking-assist";

const initial = {
  from: "2026-11-08",
  to: "2026-11-10",
  adults: 2,
  children: 1,
  currency: "CRC" as const,
};

describe("KrossBookingAssist", () => {
  it("renders a usable official link independently of the popup for a valid search", () => {
    const html = renderToStaticMarkup(<KrossBookingAssist initial={initial} />);
    const anchor = html.match(/<a\b([^>]*)>Abrir búsqueda mediante enlace<\/a>/);

    expect(anchor).not.toBeNull();
    const attributes = anchor![1];
    const href = attributes.match(/href="([^"]+)"/)?.[1].replaceAll("&amp;", "&");
    const url = new URL(href!);
    expect(url.origin + url.pathname).toBe("https://dreamcatcherhotel.kross.travel/book/step1");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      from: initial.from,
      to: initial.to,
      adults: "2",
      children: "1",
      rooms: "1",
      currency: "CRC",
    });
    expect(attributes).toContain('target="_blank"');
    expect(attributes).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Si no se abre una pestaña, usa este enlace.");
  });

  it.each([
    { ...initial, from: "" },
    { ...initial, to: "2026-11-07" },
    { ...initial, adults: 0 },
  ])("does not offer the official link for an invalid search: %j", (invalid) => {
    const html = renderToStaticMarkup(<KrossBookingAssist initial={invalid} />);

    expect(html).not.toContain("Abrir búsqueda mediante enlace");
    expect(html).not.toContain('href="https://dreamcatcherhotel.kross.travel/');
  });
});
