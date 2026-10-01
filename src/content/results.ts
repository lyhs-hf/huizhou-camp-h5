import type { ExpectationType } from "./types";
export const results: Record<
  ExpectationType,
  { headline: string; details: string; focus: string; image: string }
> = {
  culture: {
    headline: "孩子不是“听过”，\n而是真的做过。",
    details: "一盏鱼灯，一笔徽墨，一份年礼。\n把文化的温度，留在孩子手里。",
    focus: "鱼灯 · 徽墨 · 食桃 · 楹联 · 文化手作",
    image: "/assets/lantern/night.webp",
  },
  curiosity: {
    headline: "旅行有没有让孩子，\n重新开始提问。",
    details: "从古村水系到山林观察，\n带着好奇心，走进冬日黄山。",
    focus: "古村 · 水系 · 山野观察 · 黄山自然",
    image: "/assets/mountain/panorama.webp",
  },
  family: {
    headline: "几年以后，\n他还会不会记得这个冬天。",
    details: "青石巷里的灯，天井里的年宴，\n还有一家人一起看过的山。",
    focus: "鱼灯夜游 · 老宅年宴 · 黄山 · 亲子时光",
    image: "/assets/new-year/banquet.webp",
  },
};
