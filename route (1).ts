import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ submissions });
}
