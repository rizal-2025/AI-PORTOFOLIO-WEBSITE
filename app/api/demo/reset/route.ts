import { type NextRequest, NextResponse } from "next/server";

import { resetAuraDemo } from "@/lib/aura-demo/client.server";
import { validatePostEmptyRequest } from "@/lib/aura-demo/request";
import { publicError, publicJson } from "@/lib/aura-demo/response";
import {
  clientErrorResponseForSession,
  requireAuraDemoSession,
} from "@/lib/aura-demo/route.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestError = await validatePostEmptyRequest(request);
  if (requestError !== null) {
    return publicError(requestError);
  }
  const context = await requireAuraDemoSession(request);
  if (context instanceof NextResponse) {
    return context;
  }
  try {
    const result = await resetAuraDemo(
      context.config,
      context.sessionToken,
      context.clientSubject,
    );
    return publicJson(result, 200);
  } catch (error) {
    return clientErrorResponseForSession(error, context.config);
  }
}
