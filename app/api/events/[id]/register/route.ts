import { NextResponse, type NextRequest } from "next/server";
import { registerEvent } from "@/app/(main)/events/[id]/registerEvent";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const formData = new FormData();
  formData.set("event_id", id);
  formData.set("message", String(body.message || ""));

  const result = await registerEvent(formData);
  return NextResponse.json(result);
}
