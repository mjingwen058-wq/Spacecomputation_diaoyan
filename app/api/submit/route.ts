import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const name = str(body.name);
  const gender = str(body.gender);
  const major = str(body.major);
  const grade = str(body.grade);
  const campus = str(body.campus);
  const email = str(body.email);
  const thoughts = str(body.thoughts);
  const wantsCore = Boolean(body.wantsCore);
  const engagementChoice = str(body.engagementChoice);
  const avatarSeed = str(body.avatarSeed) || Math.random().toString(36).slice(2);

  if (!name || !gender || !major || !grade || !campus || !email) {
    return NextResponse.json({ error: "缺少必填信息" }, { status: 400 });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }

  const id = randomUUID();
  const interestsA = wantsCore ? [] : strArr(body.interestsA);
  const otherInterest: string | null = null;
  const futureWish = wantsCore ? null : str(body.futureWish) || null;
  const departments: string[] = [];
  const skills = wantsCore ? str(body.skills) || null : null;
  const learnOrInitiate = wantsCore ? str(body.learnOrInitiate) || null : null;
  const pace = wantsCore ? str(body.pace) || null : null;

  try {
    await sql`
      INSERT INTO "Submission"
        ("id", "name", "gender", "major", "grade", "campus", "email", "thoughts",
         "wantsCore", "avatarSeed", "interestsA", "otherInterest", "futureWish",
         "departments", "skills", "engagementChoice", "learnOrInitiate", "pace")
      VALUES
        (${id}, ${name}, ${gender}, ${major}, ${grade}, ${campus}, ${email}, ${thoughts},
         ${wantsCore}, ${avatarSeed}, ${interestsA}, ${otherInterest}, ${futureWish},
         ${departments}, ${skills}, ${engagementChoice}, ${learnOrInitiate}, ${pace})
    `;
    return NextResponse.json({ id, avatarSeed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
