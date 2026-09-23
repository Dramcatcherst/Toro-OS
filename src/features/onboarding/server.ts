import "server-only";

import onboardingManifest from "../../../data/toro_onboarding_journeys_v2.json";

import { resolveToroContext } from "@/features/context/resolver";
import { resolveToroMenu } from "@/features/menu/resolver";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type OnboardingChoice = {
  key: string;
  emoji?: string;
  label: string;
};

export type ToroOnboardingStep = {
  key: string;
  message: string;
  prompt?: string;
  choices?: OnboardingChoice[];
  dynamic_choices?: string;
  free_text?: string;
  completion?: string;
};

export type ToroOnboardingJourney = {
  key: string;
  purpose: string;
  steps: ToroOnboardingStep[];
};

export type ToroOnboardingFirstValueTarget = {
  key: string;
  capability: string;
  label: string;
  href: string;
};

export type ToroOnboardingView = {
  firstName: string;
  businessName: string;
  profileId: string | null;
  journey: ToroOnboardingJourney | null;
  firstValueTargets: ToroOnboardingFirstValueTarget[];
  state: "resolved" | "context_choice_required";
};

type Manifest = {
  journeys: Record<
    string,
    {
      purpose: string;
      steps: ToroOnboardingStep[];
    }
  >;
};

const manifest = onboardingManifest as Manifest;

const journeyByProfile: Record<string, string> = {
  owner_executive: "owner_admin",
  manager: "manager_lead",
  reception: "reception",
  housekeeping: "housekeeping",
  maintenance: "maintenance",
  finance: "specialist_office",
  hr_people: "specialist_office",
  growth: "specialist_office",
  systems: "specialist_office",
  auditor: "specialist_office",
  department_lead: "manager_lead",
  employee_general: "employee_general",
};

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "Hola";
}

async function resolveBusinessName(orgId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .limit(1);

    if (error || !Array.isArray(data) || !data.length) return "tu negocio";
    const value = (data[0] as { name?: unknown }).name;
    return typeof value === "string" && value.trim() ? value.trim() : "tu negocio";
  } catch {
    return "tu negocio";
  }
}

export async function resolveCurrentOnboarding(): Promise<ToroOnboardingView | null> {
  const context = await resolveToroContext({ mode: "organization" });
  if (!context) return null;

  if (context.requiresContextChoice || !context.orgId || !context.membership) {
    return {
      firstName: firstName(context.displayName),
      businessName: "tu negocio",
      profileId: null,
      journey: null,
      firstValueTargets: [],
      state: "context_choice_required",
    };
  }

  const membership = context.membership;
  const profile = resolveToroMenu({
    mode: "organization",
    roles: membership.roles,
    positionCode: membership.positionCode,
    positionName: membership.positionName,
    capabilityStates: {},
    hasSecondaryOptions: false,
  });

  const profileId = profile?.profileId ?? null;
  const journeyKey = profileId ? journeyByProfile[profileId] : null;
  const rawJourney = journeyKey ? manifest.journeys[journeyKey] : null;
  const businessName = await resolveBusinessName(context.orgId);

  let firstValueTargets: ToroOnboardingFirstValueTarget[] = [];
  let adaptedJourney: ToroOnboardingJourney | null =
    journeyKey && rawJourney
      ? {
          key: journeyKey,
          purpose: rawJourney.purpose,
          steps: rawJourney.steps.map((step) => ({
            ...step,
            choices: step.choices ? [...step.choices] : undefined,
          })),
        }
      : null;

  try {
    const currentMenu = await resolveCurrentToroReadOnlyMenu();
    const readableItems =
      currentMenu?.menu?.items.filter((item) => item.state === "READ_ONLY") ?? [];

    const focusable = new Set(currentMenu?.focusableCapabilities ?? []);
    const onboardingItems = [...readableItems].sort((a, b) => {
      const aFocus = focusable.has(a.capability) ? 1 : 0;
      const bFocus = focusable.has(b.capability) ? 1 : 0;
      return bFocus - aFocus;
    });

    if (adaptedJourney?.steps[0] && onboardingItems.length > 0) {
      adaptedJourney.steps[0] = {
        ...adaptedJourney.steps[0],
        choices: onboardingItems.slice(0, 3).map((item) => ({
          key: item.key,
          emoji: item.emoji,
          label: item.label,
        })),
      };
    }

    firstValueTargets = onboardingItems
      .filter((item) => focusable.has(item.capability))
      .slice(0, 3)
      .map((item) => ({
        key: item.key,
        capability: item.capability,
        label: item.label,
        href: `/my-toro?focus=${encodeURIComponent(item.capability)}`,
      }));
  } catch {
    // Onboarding still works from its role manifest if the source-aware menu
    // cannot be resolved. No target is suggested rather than inventing one.
  }

  return {
    firstName: firstName(
      membership.employeePreferredName ?? context.displayName,
    ),
    businessName,
    profileId,
    journey: adaptedJourney,
    firstValueTargets,
    state: "resolved",
  };
}
