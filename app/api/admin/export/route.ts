import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

function csvCell(v: unknown): string {
  let s: string;
  if (Array.isArray(v)) s = v.join("; ");
  else if (v === null || v === undefined) s = "";
  else if (v instanceof Date) s = v.toISOString();
  else s = String(v);
  if (/[",\n]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const COLUMNS: Array<[string, string]> = [
  ["id", "ID"],
  ["createdAt", "提交时间"],
  ["name", "姓名"],
  ["gender", "性别"],
  ["major", "专业"],
  ["grade", "年级"],
  ["campus", "校区"],
  ["email", "邮箱"],
  ["thoughts", "看法与期待"],
  ["wantsCore", "是否想深度参与"],
  ["engagementChoice", "参与意愿原始选项"],
  ["interestsA", "感兴趣的方向"],
  ["futureWish", "未来希望的内容"],
  ["skills", "特长/经验"],
  ["learnOrInitiate", "想学习/想发起的事"],
  ["pace", "参与节奏"],
];

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

  const header = COLUMNS.map(([, label]) => csvCell(label)).join(",");
  const rows = submissions.map((s) =>
    COLUMNS.map(([key]) => csvCell((s as any)[key])).join(","),
  );
  const csv = "" + [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="scaa-submissions-${Date.now()}.csv"`,
    },
  });
}
