import type { Metadata } from "next";

import { KrossBookingAssist } from "@/features/kross/booking-assist";

export const metadata: Metadata = {
  title: "TORO Brain · Buscar en Kross",
  description:
    "Prepara una búsqueda segura en el motor oficial de Dreamcatcher sin convertir el resultado en verdad interna de TORO.",
};

export default function BookingAssistPage() {
  return <KrossBookingAssist />;
}
