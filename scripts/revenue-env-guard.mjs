import { pathToFileURL } from "node:url";

export function validateRevenueBuildEnv(env = process.env) {
  if (!env.VERCEL) return true;

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
