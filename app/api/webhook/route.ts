import { NextRequest, NextResponse } from "next/server";

async function ImageWebhook(req: NextRequest, res: NextResponse) {
  return NextResponse.json(res.text(), { status: res.status });
}

export const POST = ImageWebhook;
