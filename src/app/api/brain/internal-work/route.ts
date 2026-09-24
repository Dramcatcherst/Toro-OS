import { NextResponse } from "next/server";

import { createToroInternalWork } from "@/features/actions/internal-work-server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await createToroInternalWork(body);

  switch (result.state) {
    case "created":
      return NextResponse.json(
        {
          state: result.state,
          externalWrite: false,
          canonicalWrite: "operations.tasks",
          task: result.task,
        },
        { status: 201 },
      );
    case "replayed":
      return NextResponse.json({
        state: result.state,
        externalWrite: false,
        canonicalWrite: "operations.tasks",
        task: result.task,
      });
    case "invalid":
      return NextResponse.json(result, { status: 400 });
    case "unauthenticated":
      return NextResponse.json(result, { status: 401 });
    case "forbidden":
      return NextResponse.json(result, { status: 403 });
    case "unavailable":
    default:
      return NextResponse.json(result, { status: 503 });
  }
}
