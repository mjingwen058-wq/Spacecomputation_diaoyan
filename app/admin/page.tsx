"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import PixelBackdrop from "@/components/PixelBackdrop";
import PixelAvatarCanvas from "@/components/PixelAvatarCanvas";

interface Submission {
  id: string;
  createdAt: string;
  name: string;
  gender: string;
  major: string;
  grade: string;
  campus: string;
  email: string;
  thoughts: string;
  wantsCore: boolean;
  interestsA: string[];
  otherInterest: string | null;
  futureWish: string | null;
  departments: string[];
  skills: string | null;
  avatarSeed: string;
}

const CHART_COLORS = ["#F2C94C", "#56CCF2", "#BB6BD9", "#6FCF97", "#F2994A", "#EB5757", "#9B9B9B"];

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSubmissions() {
    const res = await fetch("/api/admin/submissions");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setAuthed(true);
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("密码错误");
      return;
    }
    await loadSubmissions();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSubmissions([]);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这条记录吗？删除后无法恢复。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setSelected((prev) => (prev?.id === id ? null : prev));
      } else {
        alert("删除失败，请重试");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => buildStats(submissions), [submissions]);

  if (authed === null) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PixelBackdrop />
      </main>
    );
  }

  if (!authed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PixelBackdrop />
        <form
          onSubmit={handleLogin}
          style={{ position: "relative", zIndex: 1, width: 320, textAlign: "center" }}
        >
          <span className="chip">SCAA 后台</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, margin: "18px 0 24px" }}>
            管理员登录
          </h1>
          <input
            className="field-input"
            type="password"
            placeholder="请输入管理密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 16, textAlign: "center" }}
            autoFocus
          />
          {loginError && (
            <p style={{ color: "#EB5757", fontSize: 13, marginBottom: 12 }}>{loginError}</p>
          )}
          <button className="next-btn" type="submit" style={{ width: "100%" }}>
            进入
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", padding: "40px 24px 80px" }}>
      <PixelBackdrop />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <span className="chip">SCAA 后台</span>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, marginTop: 12 }}>
              招新问卷数据看板
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="/api/admin/export"
              className="next-btn"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              导出 CSV
            </a>
            <button className="ghost-btn" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </div>

        <SummaryRow stats={stats} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
          <ChartCard title="年级分布">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.gradeData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" width={90} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#F2C94C" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="校区分布">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.campusData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" width={90} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#6FCF97" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="性别分布">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.genderData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {stats.genderData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="常规成员 · 感兴趣方向">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.interestData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" width={160} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#56CCF2" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="核心成员 · 意向部门">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.deptData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" width={160} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#BB6BD9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, margin: "36px 0 14px" }}>
          全部填写记录（{submissions.length}）
        </h2>
        <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", background: "rgba(255,255,255,0.05)" }}>
                {["提交时间", "姓名", "性别", "专业", "年级", "校区", "邮箱", "类型", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={cellStyle}>{new Date(s.createdAt).toLocaleString("zh-CN")}</td>
                  <td style={cellStyle}>{s.name}</td>
                  <td style={cellStyle}>{s.gender}</td>
                  <td style={cellStyle}>{s.major}</td>
                  <td style={cellStyle}>{s.grade}</td>
                  <td style={cellStyle}>{s.campus}</td>
                  <td style={cellStyle}>{s.email}</td>
                  <td style={cellStyle}>{s.wantsCore ? "核心意向" : "常规成员"}</td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="ghost-btn" style={{ padding: "4px 10px" }} onClick={() => setSelected(s)}>
                        详情
                      </button>
                      <button
                        className="ghost-btn"
                        style={{ padding: "4px 10px", color: "#EB5757", borderColor: "rgba(235,87,87,0.4)" }}
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                      >
                        {deletingId === s.id ? "删除中…" : "删除"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: "center", opacity: 0.5 }}>
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailModal submission={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function SummaryRow({ stats }: { stats: ReturnType<typeof buildStats> }) {
  const items = [
    { label: "总提交数", value: stats.total },
    { label: "核心成员意向", value: stats.coreCount },
    { label: "常规成员", value: stats.total - stats.coreCount },
  ];
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            flex: 1,
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 14,
            padding: "18px 20px",
          }}
        >
          <p style={{ fontSize: 12, opacity: 0.55, marginBottom: 6 }}>{it.label}</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px 18px" }}>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>{title}</p>
      {children}
    </div>
  );
}

function DetailModal({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0b0b0d",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 18,
          padding: 28,
          maxWidth: 520,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <PixelAvatarCanvas seed={submission.avatarSeed} size={72} />
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>
              {submission.name}
            </p>
            <p style={{ fontSize: 12, opacity: 0.55 }}>{submission.email}</p>
          </div>
        </div>
        <DetailRow label="性别">{submission.gender}</DetailRow>
        <DetailRow label="专业">{submission.major}</DetailRow>
        <DetailRow label="年级">{submission.grade}</DetailRow>
        <DetailRow label="校区">{submission.campus}</DetailRow>
        <DetailRow label="看法与期待">{submission.thoughts}</DetailRow>
        <DetailRow label="类型">{submission.wantsCore ? "核心成员意向" : "常规成员"}</DetailRow>
        {submission.wantsCore ? (
          <>
            <DetailRow label="意向部门（按心仪顺序）">
              {submission.departments.map((d, i) => `${i + 1}.${d}`).join(" > ") || "—"}
            </DetailRow>
            <DetailRow label="特长/经验">{submission.skills || "—"}</DetailRow>
          </>
        ) : (
          <>
            <DetailRow label="感兴趣方向">{submission.interestsA.join("、") || "—"}</DetailRow>
            <DetailRow label="其他方向">{submission.otherInterest || "—"}</DetailRow>
            <DetailRow label="未来希望内容">{submission.futureWish || "—"}</DetailRow>
          </>
        )}
        <button className="next-btn" style={{ marginTop: 16 }} onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{children}</p>
    </div>
  );
}

const cellStyle: React.CSSProperties = { padding: "10px 14px", whiteSpace: "nowrap" };
const tooltipStyle = {
  background: "#0b0b0d",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  fontSize: 12,
};

function buildStats(submissions: Submission[]) {
  const total = submissions.length;
  const coreCount = submissions.filter((s) => s.wantsCore).length;

  const genderCount = new Map<string, number>();
  const gradeCount = new Map<string, number>();
  const campusCount = new Map<string, number>();
  const interestCount = new Map<string, number>();
  const deptCount = new Map<string, number>();

  for (const s of submissions) {
    genderCount.set(s.gender, (genderCount.get(s.gender) ?? 0) + 1);
    gradeCount.set(s.grade, (gradeCount.get(s.grade) ?? 0) + 1);
    campusCount.set(s.campus, (campusCount.get(s.campus) ?? 0) + 1);
    for (const i of s.interestsA ?? []) {
      interestCount.set(i, (interestCount.get(i) ?? 0) + 1);
    }
    for (const d of s.departments ?? []) {
      deptCount.set(d, (deptCount.get(d) ?? 0) + 1);
    }
  }

  const toArr = (m: Map<string, number>) =>
    Array.from(m.entries()).map(([name, value]) => ({ name, value }));

  return {
    total,
    coreCount,
    genderData: toArr(genderCount),
    gradeData: toArr(gradeCount),
    campusData: toArr(campusCount),
    interestData: toArr(interestCount).map((d) => ({ ...d, name: shorten(d.name) })),
    deptData: toArr(deptCount),
  };
}

function shorten(s: string) {
  return s.length > 14 ? s.slice(0, 14) + "…" : s;
}
