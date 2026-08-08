import { type NextRequest, NextResponse } from "next/server";

import { getAuraDemoReservations } from "@/lib/aura-demo/client.server";
import { validateGetEmptyRequest } from "@/lib/aura-demo/request";
import { publicError, publicJson } from "@/lib/aura-demo/response";
import {
  clientErrorResponseForSession,
  requireAuraDemoSession,
} from "@/lib/aura-demo/route.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestError = validateGetEmptyRequest(request);
  if (requestError !== null) {
    return publicError(requestError);
  }
  const context = await requireAuraDemoSession(request);
  if (context instanceof NextResponse) {
    return context;
  }
  try {
    const result = await getAuraDemoReservations(
      context.config,
      context.sessionToken,
      context.clientSubject,
    );
    return publicJson(result, 200);
  } catch (error) {
    return clientErrorResponseForSession(error, context.config);
  }
}
