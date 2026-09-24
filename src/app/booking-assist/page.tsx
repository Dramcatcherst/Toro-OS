import type { Metadata } from "next";

import { KrossBookingAssist } from "@/features/kross/booking-assist";
import { parseBookingAssistPrefill } from "@/features/kross/booking-assist-prefill";

export const metadata: Metadata = {
  title: "TORO Brain · Buscar en Kross",
  description:
    "Prepara una búsqueda segura en el motor oficial de Dreamcatcher sin convertir el resultado en verdad interna de TORO.",
};

export default async function BookingAssistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }

  const initial = parseBookingAssistPrefill(params);
  return <KrossBookingAssist initial={initial} />;
}
