import { NextRequest, NextResponse } from "next/server";

async function ImageWebhook(req: NextRequest, res: NextResponse) {
  return NextResponse.json(res, { status: res.status });
}

export const GET = ImageWebhook;
