export const GENDER_OPTIONS = ["男", "女", "其他 / 不便透露"];

export const GRADE_OPTIONS = [
  "本科一年级",
  "本科二年级",
  "本科三年级",
  "本科四年级",
  "研究生及以上",
];

export const CORE_OPTIONS = [
  {
    value: "A",
    label: "感兴趣的活动就参加，慢慢感受，不急着定位自己",
    isCore: false,
  },
  {
    value: "B",
    label: "想尽快参与具体的事，跟着一起做",
    isCore: true,
  },
  {
    value: "C",
    label: "喜欢社团的整体基调，希望长期关注、参与社团发展",
    isCore: true,
  },
];

export const INTEREST_OPTIONS = [
  "XR / 虚实融合媒介与空间交互",
  "空间合成、3D 重建与生成式环境（如 NeRF、3D GS 等）",
  "具身智能、动态感知与硬件交互",
  "AI 驱动的敏捷开发 / Vibe Coding / 创意编程",
  "空间交互装置、前沿艺术与策展实践",
];

export const PACE_OPTIONS = [
  "先跟着节奏参与，慢慢感受和熟悉",
  "稳定投入一些时间，一起把事情往前推",
  "希望更深度地卷入，多花时间、多担事",
];

export const CAMPUS_OPTIONS = ["象山", "良渚", "南山"];

export type StepType =
  | "text"
  | "email"
  | "radio"
  | "textarea"
  | "checkbox"
  | "rank"
  | "campus";

export interface Step {
  id: string;
  title: string;
  hint?: string;
  type: StepType;
  options?: string[];
  optional?: boolean;
  placeholder?: string;
}

// Part 1 - always shown
export const PART1: Step[] = [
  { id: "name", title: "姓名", type: "text", placeholder: "你的名字" },
  { id: "gender", title: "性别", type: "radio", options: GENDER_OPTIONS },
  { id: "major", title: "专业", type: "text", placeholder: "你的专业" },
  { id: "grade", title: "年级", type: "radio", options: GRADE_OPTIONS },
  { id: "campus", title: "选择校区", type: "campus" },
  {
    id: "email",
    title: "常用邮箱",
    hint: "重要：后续通知与反馈将通过此邮箱统一发送",
    type: "email",
    placeholder: "name@example.com",
  },
  {
    id: "thoughts",
    title: "你对目前 SCAA 的一些看法与期待？",
    hint: "随便聊聊，比如好奇的议题、想吐槽的点或想玩的实验",
    type: "textarea",
    placeholder: "写点什么……",
  },
  {
    id: "wantsCore",
    title: "如果真的参与进来，你更希望自己是哪种状态？",
    type: "radio",
    options: CORE_OPTIONS.map((o) => o.label),
  },
];

// Branch A - lighter touch, exploring interests
export const BRANCH_A: Step[] = [
  {
    id: "interestsA",
    title: "你最感兴趣的方向是什么？",
    hint: "可多选",
    type: "checkbox",
    options: INTEREST_OPTIONS,
  },
  {
    id: "futureWish",
    title: "你未来最希望多参加什么样的内容？",
    hint: "例如：前沿工具实操工作坊、硬核黑客松、技术拆解研讨会、自由交流局等",
    type: "textarea",
    placeholder: "写点什么……",
  },
];

// Branch B - deeper engagement, gauging initiative
export const BRANCH_B: Step[] = [
  {
    id: "skills",
    title: "请简述你的特长、组织活动经验或宣传经历",
    hint: "代码、3D、硬件实验、项目折腾，或是策展办活动、自媒体排版均可，展现你的实操能力即可",
    type: "textarea",
    placeholder: "写点什么……",
  },
  {
    id: "learnOrInitiate",
    title: "有没有你特别想学习，或者自己想发起主导、但一直还没有机会做的事情？",
    type: "textarea",
    placeholder: "写点什么……",
  },
  {
    id: "pace",
    title: "你希望以怎样的节奏参与？",
    type: "radio",
    options: PACE_OPTIONS,
  },
];
