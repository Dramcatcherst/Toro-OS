import { NextResponse } from "next/server";

import { resolveToroContext } from "@/features/context/resolver";
import { submitMyLeaveRequest } from "@/features/people/leave/server";

export async function POST(request: Request) {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    return NextResponse.json(
      { error: "Selecciona un contexto de empresa válido." },
      {
        status: 401,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  const payload = await request.json().catch(() => null);
  const result = await submitMyLeaveRequest(context, payload);

  if (result.status === "created") {
    return NextResponse.json(
      { id: result.id },
      {
        status: 201,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  if (result.status === "not_available") {
    return NextResponse.json(
      { error: "Tu cuenta no está habilitada para crear esta solicitud." },
      {
        status: 403,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  return NextResponse.json(
    { error: result.error },
    {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
