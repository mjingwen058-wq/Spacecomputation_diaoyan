"use client";

import { useMemo, useState } from "react";
import PixelBackdrop from "@/components/PixelBackdrop";
import PixelAvatarCanvas from "@/components/PixelAvatarCanvas";
import {
  PART1,
  BRANCH_A,
  BRANCH_B,
  CORE_OPTIONS,
  CAMPUS_OPTIONS,
  Step,
} from "@/lib/questions";
import { randomSeed } from "@/lib/pixelAvatar";

type View = "intro" | "question" | "submitting" | "thanks" | "error";

const CORE_YES_LABEL = CORE_OPTIONS[1].label;

export default function Home() {
  const [view, setView] = useState<View>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [avatarSeed, setAvatarSeed] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  const isCore = answers.wantsCore === CORE_YES_LABEL;
  const branchSteps = isCore ? BRANCH_B : BRANCH_A;
  const steps: Step[] = useMemo(
    () => [...PART1, ...branchSteps],
    [isCore],
  );
  const current = steps[stepIndex];
  const total = steps.length;

  function setAnswer(id: string, value: any) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function canAdvance(step: Step) {
    const v = answers[step.id];
    if (step.optional) return true;
    if (step.type === "checkbox" || step.type === "rank")
      return Array.isArray(v) && v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null;
  }

  function goNext() {
    if (!current) return;
    if (!canAdvance(current)) return;
    if (stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1);
    } else {
      handleSubmit();
    }
  }

  function goBack() {
    if (stepIndex === 0) {
      setView("intro");
      return;
    }
    setStepIndex(stepIndex - 1);
  }

  async function handleSubmit() {
    setView("submitting");
    const seed = randomSeed();
    setAvatarSeed(seed);

    const payload: Record<string, any> = {
      name: answers.name ?? "",
      gender: answers.gender ?? "",
      major: answers.major ?? "",
      grade: answers.grade ?? "",
      campus: answers.campus ?? "",
      email: answers.email ?? "",
      thoughts: answers.thoughts ?? "",
      wantsCore: isCore,
      avatarSeed: seed,
    };

    if (isCore) {
      payload.departments = answers.departments ?? [];
      payload.skills = answers.skills ?? "";
    } else {
      payload.interestsA = answers.interestsA ?? [];
      payload.otherInterest = answers.otherInterest ?? "";
      payload.futureWish = answers.futureWish ?? "";
    }

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setView("thanks");
    } catch (e: any) {
      setErrorMsg(e?.message || "提交失败，请稍后重试");
      setView("error");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <PixelBackdrop />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560 }}>
        {view === "intro" && (
          <IntroScreen onStart={() => setView("question")} />
        )}

        {view === "question" && current && (
          <QuestionScreen
            step={current}
            index={stepIndex}
            total={total}
            value={answers[current.id]}
            onChange={(v) => setAnswer(current.id, v)}
            onNext={goNext}
            onBack={goBack}
            canAdvance={canAdvance(current)}
            isLast={stepIndex === steps.length - 1}
          />
        )}

        {view === "submitting" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", opacity: 0.7 }}>
              提交中 …
            </p>
          </div>
        )}

        {view === "thanks" && (
          <ThanksScreen seed={avatarSeed} name={answers.name} />
        )}

        {view === "error" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ marginBottom: 16 }}>提交时出了点问题：{errorMsg}</p>
            <button className="next-btn" onClick={() => setView("question")}>
              返回重试
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <span className="chip">SCAA</span>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 32,
          marginTop: 18,
          marginBottom: 6,
          letterSpacing: "0.01em",
        }}
      >
        新学期招新 & 核心成员招募
      </h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 28 }}>
        SCAA 空间计算研究所
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 14 }}>
        欢迎来到 SCAA。我们专注下一代空间智能生态，探索空间合成、XR
        虚实融合、具身智能与 Vibe Coding 创意开发。
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 14 }}>
        在 SCAA，我们持续发起前沿讲座、实操工作坊、展览共创与先锋竞赛项目，为每一个对未来媒介充满野心的创作者提供开放实验场。
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 36 }}>
        现在轮到你了~请花 3 分钟填写这份问卷，让我们认识真正的你！
      </p>
      <button className="next-btn" onClick={onStart}>
        开始填写 →
      </button>
    </div>
  );
}

function QuestionScreen({
  step,
  index,
  total,
  value,
  onChange,
  onNext,
  onBack,
  canAdvance,
  isLast,
}: {
  step: Step;
  index: number;
  total: number;
  value: any;
  onChange: (v: any) => void;
  onNext: () => void;
  onBack: () => void;
  canAdvance: boolean;
  isLast: boolean;
}) {
  return (
    <div>
      <ProgressDots index={index} total={total} />
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          opacity: 0.5,
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {step.title}
        {step.optional && (
          <span style={{ fontSize: 13, opacity: 0.4, fontWeight: 400 }}> （可跳过）</span>
        )}
      </h2>
      {step.hint && (
        <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 22 }}>{step.hint}</p>
      )}
      {!step.hint && <div style={{ marginBottom: 22 }} />}

      <div style={{ marginBottom: 32 }}>
        {(step.type === "text" || step.type === "email") && (
          <input
            className="field-input"
            type={step.type}
            placeholder={step.placeholder}
            value={value ?? ""}
            autoFocus
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAdvance) onNext();
            }}
          />
        )}

        {step.type === "textarea" && (
          <textarea
            className="field-input"
            placeholder={step.placeholder}
            value={value ?? ""}
            autoFocus
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {step.type === "radio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {step.options?.map((opt) => (
              <button
                key={opt}
                className={"option-btn" + (value === opt ? " selected" : "")}
                onClick={() => {
                  onChange(opt);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.type === "checkbox" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {step.options?.map((opt) => {
              const arr: string[] = Array.isArray(value) ? value : [];
              const checked = arr.includes(opt);
              return (
                <button
                  key={opt}
                  className={"option-btn" + (checked ? " selected" : "")}
                  onClick={() => {
                    const next = checked
                      ? arr.filter((x) => x !== opt)
                      : [...arr, opt];
                    onChange(next);
                  }}
                >
                  {checked ? "☑ " : "☐ "}
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {step.type === "rank" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {step.options?.map((opt) => {
              const arr: string[] = Array.isArray(value) ? value : [];
              const idx = arr.indexOf(opt);
              const marks = ["①", "②", "③", "④", "⑤", "⑥"];
              const mark = idx !== -1 ? marks[idx] ?? `${idx + 1}.` : "○";
              return (
                <button
                  key={opt}
                  className={"option-btn" + (idx !== -1 ? " selected" : "")}
                  onClick={() => {
                    const next =
                      idx === -1 ? [...arr, opt] : arr.filter((x) => x !== opt);
                    onChange(next);
                  }}
                >
                  {mark}  {opt}
                </button>
              );
            })}
          </div>
        )}

        {step.type === "campus" && (
          <CampusField value={value} onChange={onChange} onEnter={onNext} canAdvance={canAdvance} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="ghost-btn" onClick={onBack}>
          ← 上一步
        </button>
        <button className="next-btn" disabled={!canAdvance} onClick={onNext}>
          {isLast ? "提交" : "下一步"}
        </button>
      </div>
    </div>
  );
}

function CampusField({
  value,
  onChange,
  onEnter,
  canAdvance,
}: {
  value: any;
  onChange: (v: any) => void;
  onEnter: () => void;
  canAdvance: boolean;
}) {
  const isOther = typeof value === "string" && value !== "" && !CAMPUS_OPTIONS.includes(value);
  const [otherMode, setOtherMode] = useState(isOther);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...CAMPUS_OPTIONS, "其他"].map((opt) => {
          const isOtherBtn = opt === "其他";
          const selected = isOtherBtn ? otherMode : value === opt;
          return (
            <button
              key={opt}
              className={"option-btn" + (selected ? " selected" : "")}
              onClick={() => {
                if (isOtherBtn) {
                  setOtherMode(true);
                  onChange(isOther ? value : "");
                } else {
                  setOtherMode(false);
                  onChange(opt);
                }
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {otherMode && (
        <input
          className="field-input"
          style={{ marginTop: 14 }}
          type="text"
          placeholder="请填写校区名称"
          value={isOther ? value : ""}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAdvance) onEnter();
          }}
        />
      )}
    </div>
  );
}

function ProgressDots({ index, total }: { index: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            flex: 1,
            background: i <= index ? "#ffffff" : "rgba(255,255,255,0.18)",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

function ThanksScreen({ seed, name }: { seed: string; name?: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 20,
        padding: "40px 32px",
        textAlign: "center",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <span className="chip">提交成功</span>
      <div style={{ display: "flex", justifyContent: "center", margin: "26px 0" }}>
        <PixelAvatarCanvas seed={seed} size={200} />
      </div>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        这是属于{name ? ` ${name} ` : "你"}的专属像素小人
      </h2>
      <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.75 }}>
        感谢你认真填写问卷。我们已经收到你的信息，后续的招新进度、成员分组及活动安排，我们将通过邮件统一回复，请留意查收收件箱。期待与你在线上线下相遇！
      </p>
    </div>
  );
}
