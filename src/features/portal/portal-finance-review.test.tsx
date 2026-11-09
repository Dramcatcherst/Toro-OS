import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { emptyFinanceReview } from "./finance-review";
import { PortalFinanceReview } from "./portal-finance-review";

describe("PortalFinanceReview", () => {
  it("renders scoped review evidence without amounts or source keys", () => {
    const html=renderToStaticMarkup(<PortalFinanceReview view={{...emptyFinanceReview("ready"),readAt:"2026-11-09T06:05:00.000Z",rowsRead:1,reviewCount:1,currencies:["USD"],latestUpdatedAt:"2026-09-29T07:10:17.215Z",items:[{id:"REC-1",periodMonth:"2026-09-01",status:"unmatched",confidence:"high",currency:"USD",updatedAt:"2026-09-29T07:10:17.215Z"}]}} />);
    expect(html).toContain("1 de 1 registros requieren revisión"); expect(html).toContain("REC-1"); expect(html).toContain("Solo lectura");
    expect(html).not.toContain("amount"); expect(html).not.toContain("source_key");
  });
  it("makes unavailable and denied states explicit", () => {
    expect(renderToStaticMarkup(<PortalFinanceReview view={emptyFinanceReview("unavailable")} />)).toContain("no está disponible");
    expect(renderToStaticMarkup(<PortalFinanceReview view={emptyFinanceReview("denied")} />)).toContain("no tiene permiso financiero");
  });
});
