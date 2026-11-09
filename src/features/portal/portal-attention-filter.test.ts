import { describe, expect, it } from "vitest";
import { attentionCurrency, attentionMonth, filterAttentionEntries } from "./portal-attention-filter";
describe("financial view filters",()=>{
  const entries=[{currency:"USD",month:"2026-09",id:"one"},{currency:"CRC",month:"2026-10",id:"two"},{currency:null,month:null,id:"unknown"}];
  it("combines currency and recorded month without converting or changing source order",()=>{
    const original=JSON.stringify(entries);
    expect(filterAttentionEntries(entries,"USD","2026-09").map(x=>x.id)).toEqual(["one"]);
    expect(filterAttentionEntries(entries,"CRC","2026-09")).toEqual([]);
    expect(filterAttentionEntries(entries,"all","all")).toEqual(entries);
    expect(JSON.stringify(entries)).toBe(original);
  });
  it("keeps unknown fields separate rather than assigning a month or currency",()=>{
    expect(filterAttentionEntries(entries,"unknown","unknown").map(x=>x.id)).toEqual(["unknown"]);
    expect(filterAttentionEntries(entries,"all","unknown")).toHaveLength(1);
    expect(filterAttentionEntries(entries,"EUR","all")).toEqual([]);
  });
  it("does not infer an accounting period from missing, invalid or timestamp-shaped dates",()=>{
    expect(attentionMonth("2026-02-28")).toBe("2026-02");
    for(const value of [null,"2026-02-30","2026-13-01","2026-2-01","2026-09-01T00:00:00Z"]) expect(attentionMonth(value)).toBeNull();
  });
  it("normalizes currency labels without introducing a default or conversion",()=>{
    expect(attentionCurrency(" usd ")).toBe("USD");
    for(const value of [null,"","dollars","US","CRC/USD"])expect(attentionCurrency(value)).toBeNull();
  });
});
