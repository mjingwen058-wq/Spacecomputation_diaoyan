import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const submissions = await sql`
    SELECT "id", "createdAt", "name", "gender", "major", "grade", "campus", "email",
           "thoughts", "wantsCore", "engagementChoice", "interestsA", "futureWish",
           "skills", "learnOrInitiate", "pace", "avatarSeed"
    FROM "Submission"
    ORDER BY "createdAt" DESC
  `;
  return NextResponse.json({ submissions });
}
