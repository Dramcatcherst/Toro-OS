import { NextResponse } from "next/server";

import { resolveToroContext } from "@/features/context/resolver";

export async function GET() {
  try {
    const context = await resolveToroContext({ mode: "organization" });

    if (!context) {
      return NextResponse.json(
        {
          state: "unresolved",
          authenticatedContext: false,
          organizationDataAllowed: false,
        },
        { status: 401 },
      );
    }

    if (context.requiresContextChoice) {
      return NextResponse.json(
        {
          state: "context_choice_required",
          authenticatedContext: true,
          organizationDataAllowed: false,
          availableOrganizationCount: context.availableOrgIds.length,
        },
        { status: 409 },
      );
    }

    if (
      context.mode !== "organization" ||
      !context.orgId ||
      !context.membership ||
      !context.canUseOrganizationData
    ) {
      return NextResponse.json(
        {
          state: "organization_context_denied",
          authenticatedContext: true,
          organizationDataAllowed: false,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      state: "resolved",
      authenticatedContext: true,
      organizationDataAllowed: true,
      membershipSource: context.membership.source,
      roleCount: context.membership.roles.length,
      employeeLinked: Boolean(context.membership.employeeId),
      allowedDataScopes: context.allowedDataScopes,
    });
  } catch {
    return NextResponse.json(
      {
        state: "runtime_unconfigured",
        authenticatedContext: false,
        organizationDataAllowed: false,
      },
      { status: 503 },
    );
  }
}
