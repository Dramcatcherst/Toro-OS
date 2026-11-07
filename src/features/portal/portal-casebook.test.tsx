import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { PortalCasebook } from "./portal-casebook";

it("labels every result as demonstration and keeps real reads and downloads closed", () => {
  const html = renderToStaticMarkup(<PortalCasebook />);
  expect(html).toContain("Expediente · demostración");
  expect(html).toContain("Datos ficticios");
  expect(html).toContain("Lectura real cerrada");
  expect(html).toContain("8 resultados de ejemplo");
  expect(html).toContain("Persona física");
  expect(html).toContain("Persona jurídica");
  expect(html).toContain("Originales y exportación no disponibles en esta demostración");
  expect(html).not.toMatch(/<a\b|<iframe\b|<form\b|download=|(?:href|src)="https?:|source_payload|dangerouslySetInnerHTML/);
});

it("renders fixture text as escaped text, never as markup", () => {
  const html = renderToStaticMarkup(<PortalCasebook />);
  expect(html).toContain("&lt;sin original&gt;");
  expect(html).not.toContain("<sin original>");
});

it("provides search, labelled filters, result selection and unique IDs across instances", () => {
  const html = renderToStaticMarkup(<><PortalCasebook /><PortalCasebook /></>);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  expect(ids.length).toBeGreaterThan(10);
  expect(new Set(ids).size).toBe(ids.length);
  for (const label of ["Buscar en ejemplos", "Entidad", "Período", "Estado", "Secciones del expediente", "Registros de ejemplo"]) expect(html).toContain(label);
  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain('aria-live="polite"');
});
