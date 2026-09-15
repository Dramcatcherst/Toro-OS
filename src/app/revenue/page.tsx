import type { Metadata } from "next";
import RevenueAdminClient from "./RevenueAdminClient";

export const metadata: Metadata = {
  title: "Revenue / Agencias | TORO OS",
  description: "Private Dreamcatcher revenue and agency rate lookup backed by canonical Supabase data.",
};

export default function RevenuePage() {
  return <RevenueAdminClient />;
}
