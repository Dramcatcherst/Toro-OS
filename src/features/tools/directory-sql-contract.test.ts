import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REVIEWED_HOTEL_LINKS } from "./directory";

const sql = readFileSync(new URL("../../../supabase/drafts/dreamcatcher_tool_links_v1.sql", import.meta.url), "utf8")
  .replace(/\r\n/g, "\n");

function reviewedSqlLinks() {
  const block = sql.match(/reviewed\(id,url\) as \(values([\s\S]*?)\n\s*\)\n\s*select/);
  if (!block) throw new Error("reviewed(id,url) allowlist not found");
  return [...block[1].matchAll(/\('([^']+)','([^']+)'\)/g)].map(match => [match[1], match[2]]);
}

describe("versioned hotel directory RPC", () => {
  it("matches the TypeScript allowlist exactly", () => {
    expect(reviewedSqlLinks()).toEqual(REVIEWED_HOTEL_LINKS.map(([id, , url]) => [id, url]));
  });

  it("preserves the existing invoker and authenticated-only permission boundary", () => {
    expect(sql).toContain("language sql stable security invoker");
    expect(sql).toContain("private.has_org_role(k.org_id, array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[])");
    expect(sql).toContain("revoke all on function public.dreamcatcher_tool_links_v1() from public,anon,authenticated,service_role;");
    expect(sql).toContain("grant execute on function public.dreamcatcher_tool_links_v1() to authenticated;");
  });
});
