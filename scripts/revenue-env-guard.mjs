import { pathToFileURL } from "node:url";

const RETIRING_AIRTABLE_BASE_IDS = new Set([
  "appuk6zInco941sgc",
  "appYRL3P7ugPtQN1h",
  "appltN1brkbhD4FVb",
]);

export function validateRevenueBuildEnv(env = process.env) {
  if (!env.VERCEL) return true;

  const airtableBaseId = String(env.AIRTABLE_BASE_ID || "").trim();
  if (airtableBaseId && RETIRING_AIRTABLE_BASE_IDS.has(airtableBaseId)) {
    throw new Error(
      "AIRTABLE_BASE_ID points to a Dreamcatcher base that is in the decommission program. Remove the override or point it to a non-retiring authority before deploying.",
    );
  }

  if (!String(env.SUPABASE_PUBLISHABLE_KEY || "").trim()) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY is required for Vercel Revenue Admin builds. Configure the publishable key in Vercel without exposing its value.",
    );
  }

  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateRevenueBuildEnv(process.env);
  console.log("Revenue Vercel environment gate passed.");
}
