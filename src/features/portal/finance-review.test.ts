import { describe, expect, it } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { DIRECTORY_SCOPE } from "@/features/tools/directory";
import { canReadPortalFinance, projectFinanceReview } from "./finance-review";

const row = { id:"11111111-1111-4111-8111-111111111111", org_id:DIRECTORY_SCOPE.orgId, property_id:DIRECTORY_SCOPE.propertyId,
  reconciliation_key:"REC-1", period_month:"2026-09-01", status:"unmatched", confidence:"high", currency:"USD", updated_at:"2026-09-29T07:10:17.215Z" };
function context(role: ToroResolvedContext["membership"] extends infer _T ? "ADMIN" | "CONTABILIDAD" | "JEFE_DEPARTAMENTO" : never): ToroResolvedContext {
  return { userId:"user-1",email:null,displayName:"User",mode:"organization",orgId:DIRECTORY_SCOPE.orgId,availableOrgIds:[DIRECTORY_SCOPE.orgId],
    allowedDataScopes:["work_org"],allowedTools:[],canUsePersonalVault:false,canUseOrganizationData:true,requiresContextChoice:false,
    membership:{ orgId:DIRECTORY_SCOPE.orgId,membershipId:"m-1",membershipType:"employee",status:"active",roles:[role],employeeId:null,source:"organization_memberships" } };
}

describe("finance review projection", () => {
  it("allows finance roles but not department heads by inference", () => {
    expect(canReadPortalFinance(context("ADMIN"))).toBe(true);
    expect(canReadPortalFinance(context("CONTABILIDAD"))).toBe(true);
    expect(canReadPortalFinance(context("JEFE_DEPARTAMENTO"))).toBe(false);
  });
  it("projects property-scoped review items without amounts or source references", () => {
    const view = projectFinanceReview([row,{...row,id:"22222222-2222-4222-8222-222222222222",reconciliation_key:"REC-2",status:"matched",currency:"CRC"}],"2026-11-09T06:05:00.000Z");
    expect(view).toMatchObject({state:"ready",rowsRead:2,reviewCount:1,currencies:["CRC","USD"],latestUpdatedAt:row.updated_at});
    expect(view.items).toEqual([{id:"REC-1",periodMonth:"2026-09-01",status:"unmatched",confidence:"high",currency:"USD",updatedAt:row.updated_at}]);
    expect(JSON.stringify(view)).not.toContain("amount");
  });
  it("fails the source closed on mixed scope, duplicate row IDs or malformed currency", () => {
    expect(projectFinanceReview([{...row,property_id:null}],"2026-11-09T06:05:00.000Z").state).toBe("unavailable");
    expect(projectFinanceReview([row,{...row,reconciliation_key:"REC-2"}],"2026-11-09T06:05:00.000Z").state).toBe("unavailable");
    expect(projectFinanceReview([{...row,currency:"usd"}],"2026-11-09T06:05:00.000Z").state).toBe("unavailable");
  });
  it("distinguishes an authorized empty read from source failure", () => {
    expect(projectFinanceReview([],"2026-11-09T06:05:00.000Z")).toMatchObject({state:"ready",rowsRead:0,reviewCount:0,total:null});
    expect(projectFinanceReview([],"invalid").state).toBe("unavailable");
  });
});
