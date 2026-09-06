import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  const avatarSeed = str(body.avatarSeed) || Math.random().toString(36).slice(2);

  if (!name || !gender || !major || !grade || !campus || !email) {
    return NextResponse.json({ error: "缺少必填信息" }, { status: 400 });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        name,
        gender,
        major,
        grade,
        campus,
        email,
        thoughts,
        wantsCore,
        avatarSeed,
        interestsA: wantsCore ? [] : strArr(body.interestsA),
        otherInterest: wantsCore ? null : str(body.otherInterest) || null,
        futureWish: wantsCore ? null : str(body.futureWish) || null,
        departments: wantsCore ? strArr(body.departments) : [],
        skills: wantsCore ? str(body.skills) || null : null,
      },
    });
    return NextResponse.json({ id: submission.id, avatarSeed: submission.avatarSeed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
