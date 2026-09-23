import type { Metadata } from "next";
import { ToroExperienceLab } from "@/features/menu/experience-lab";

export const metadata: Metadata = {
  title: "TORO Brain · Experience Lab",
  description: "Synthetic sandbox for TORO conversational menus, onboarding and guided replies.",
};

export default function ExperienceLabPage() {
  return <ToroExperienceLab />;
}
