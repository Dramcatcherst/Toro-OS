"use client";

import { DataState } from "@/components/toro/data-state";

export default function ToroError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <DataState
      variant="error"
      detail="TORO detuvo esta vista para no mostrar información incompleta como si fuera actual."
      onRetry={reset}
    />
  );
}
