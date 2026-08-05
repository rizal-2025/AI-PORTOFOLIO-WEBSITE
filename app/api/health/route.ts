import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(): NextResponse<{ status: "healthy" }> {
  return NextResponse.json(
    { status: "healthy" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
