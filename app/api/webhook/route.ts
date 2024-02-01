import { NextRequest, NextResponse } from "next/server";

async function ImageWebhook(req: NextRequest, res: NextResponse) {
  return NextResponse.json({ req, res }, { status: res.status });
}

export const POST = ImageWebhook;
