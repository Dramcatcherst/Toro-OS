import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { REVIEWED_HOTEL_LINKS } from "./directory";

const sql = readFileSync(new URL("../../../supabase/drafts/dreamcatcher_tool_links_v1.sql", import.meta.url), "utf8")
  .replace(/\r\n/g, "\n");
const catalogueSql = readFileSync(new URL("../../../supabase/drafts/dreamcatcher_tool_catalog_v1.sql", import.meta.url), "utf8")
  .replace(/\r\n/g, "\n");
const catalogueRollbackSql = readFileSync(new URL("../../../supabase/drafts/dreamcatcher_tool_catalog_v1_rollback.sql", import.meta.url), "utf8")
  .replace(/\r\n/g, "\n");
const reviewedUpgradeSql = readFileSync(new URL("../../../supabase/drafts/dreamcatcher_tool_links_v1_add_google_hotels.sql", import.meta.url), "utf8")
  .replace(/\r\n/g, "\n");
const reviewedRollbackSql = readFileSync(new URL("../../../supabase/drafts/dreamcatcher_tool_links_v1_add_google_hotels_rollback.sql", import.meta.url), "utf8")
  .replace(/\r\n/g, "\n");

function reviewedSqlLinks() {
  const block = sql.match(/reviewed\(id,url\) as \(values([\s\S]*?)\n\s*\)\n\s*select/);
  if (!block) throw new Error("reviewed(id,url) allowlist not found");
  return [...block[1].matchAll(/\('([^']+)','([^']+)'\)/g)].map(match => [match[1], match[2]]);
}

function catalogueFunctionBodyHash() {
  const marker = "$function$";
  const start = catalogueSql.indexOf(marker) + marker.length;
  const end = catalogueSql.indexOf(marker, start);
  if (start < marker.length || end < start) throw new Error("catalogue SQL function body not found");
  return createHash("md5").update(catalogueSql.slice(start, end).replace(/\r/g, "")).digest("hex");
}

function functionBodyHash(source: string) {
  const marker = "$function$";
  const start = source.indexOf(marker) + marker.length;
  const end = source.indexOf(marker, start);
  if (start < marker.length || end < start) throw new Error("SQL function body not found");
  return createHash("md5").update(source.slice(start, end).replace(/\r/g, "")).digest("hex");
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

  it("ships a guarded LINK-244 upgrade and an exact six-link rollback", () => {
    const previousHash = "a3e88afd0d1f2f6450f080c0c5fc44f9";
    const updatedHash = "d31196c3bc2a570413bb06fe111c8742";
    expect(functionBodyHash(sql)).toBe(updatedHash);
    expect(functionBodyHash(reviewedUpgradeSql)).toBe(updatedHash);
    expect(functionBodyHash(reviewedRollbackSql)).toBe(previousHash);
    expect(reviewedUpgradeSql).toContain("v_body_hash <> '" + previousHash + "'");
    expect(reviewedUpgradeSql).toContain("v_body_hash <> '" + updatedHash + "'");
    expect(reviewedUpgradeSql).toContain("expected one exact LINK-244 source entry");
    expect(reviewedRollbackSql).toContain("v_body_hash <> '" + updatedHash + "'");
    expect(reviewedRollbackSql).toContain("v_body_hash <> '" + previousHash + "'");
    for (const migration of [reviewedUpgradeSql, reviewedRollbackSql]) {
      expect(migration).toContain("create or replace function public.dreamcatcher_tool_links_v1()");
      expect(migration).toContain("language sql stable security invoker");
      expect(migration).not.toMatch(/drop\s+function|\bcascade\b/i);
      expect(migration).not.toMatch(/\b(update|insert|delete|truncate)\b/i);
    }
  });
});

describe("complete hotel catalogue RPC draft", () => {
  it("keeps the complete projection behind the exact source and management roles", () => {
    expect(catalogueSql).toMatch(/language sql\s+stable\s+security invoker/i);
    expect(catalogueSql).toContain("k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid");
    expect(catalogueSql).toContain("array['ADMIN', 'GERENCIA']::text[]");
    expect(catalogueSql).not.toContain("'JEFE_DEPARTAMENTO'");
    expect(catalogueSql).not.toContain("'AUDITOR'");
    expect(catalogueSql).toContain("revoke all\non function public.dreamcatcher_tool_catalog_v1()\nfrom public, anon, authenticated, service_role;");
    expect(catalogueSql).toContain("grant execute\non function public.dreamcatcher_tool_catalog_v1()\nto authenticated;");
  });

  it("returns only the thirteen reviewed fields and never emits an HTTP destination", () => {
    expect(catalogueSql).toMatch(/returns table \(\s*id text,\s*name text,\s*url text,\s*purpose text,\s*project text,\s*category text,\s*provider text,\s*state text,\s*lifecycle text,\s*priority text,\s*link_type text,\s*scope text,\s*home_eligible boolean\s*\)/);
    expect(catalogueSql).toContain("'^https://");
    expect(catalogueSql).not.toContain("'^https?://");
    expect(catalogueSql).toMatch(/access_token[\s\S]*jwt[\s\S]*api\[_-\]\?key[\s\S]*signed/);
    expect(catalogueSql).not.toMatch(/\b(account_refs|evidence|credential_refs)\b/);
  });

  it("ships a selective rollback without cascade or source mutation", () => {
    expect(catalogueRollbackSql).toContain("drop function public.dreamcatcher_tool_catalog_v1();");
    expect(catalogueRollbackSql).toContain("md5(replace(p.prosrc, chr(13), ''))");
    expect(catalogueFunctionBodyHash()).toBe("ff22d13d6de4f95847e7350485da11de");
    expect(catalogueRollbackSql).toContain(`v_body_hash <> '${catalogueFunctionBodyHash()}'`);
    expect(catalogueRollbackSql).not.toMatch(/drop\s+function[\s\S]*?\bcascade\b/i);
    expect(catalogueRollbackSql).not.toMatch(/\b(update|insert|delete|truncate)\b/i);
    expect(catalogueRollbackSql).toContain("public.dreamcatcher_tool_links_v1()");
  });
});
