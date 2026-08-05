import { type NextRequest, NextResponse } from "next/server";

import { postAuraDemoChat } from "@/lib/aura-demo/client.server";
import { validatePostChatRequest } from "@/lib/aura-demo/request";
import { publicError, publicJson } from "@/lib/aura-demo/response";
import {
  clientErrorResponseForSession,
  requireAuraDemoSession,
} from "@/lib/aura-demo/route.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await validatePostChatRequest(request);
  if (!validation.ok) {
    return publicError(validation.error);
  }
  const context = await requireAuraDemoSession();
  if (context instanceof NextResponse) {
    return context;
  }
  try {
    const result = await postAuraDemoChat(
      context.config,
      context.sessionToken,
      validation.value,
    );
    return publicJson(result, 200);
  } catch (error) {
    return clientErrorResponseForSession(error, context.config);
  }
}
