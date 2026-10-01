import type { InteractionId } from "./types";
export const sceneNames = [
  "序幕",
  "启程",
  "旅行期待",
  "六日行旅",
  "灯",
  "墨",
  "年",
  "山野",
  "云端",
  "平行时光",
  "归卷",
];
export const expectations = [
  {
    id: "culture" as const,
    title: "亲手做过的中国文化",
    note: "在指尖，留下一点记忆",
    number: "壹",
  },
  {
    id: "curiosity" as const,
    title: "自己发现世界的好奇心",
    note: "让看见，成为新的提问",
    number: "贰",
  },
  {
    id: "family" as const,
    title: "一家人真正一起经历过的事",
    note: "把这个冬天，留给彼此",
    number: "叁",
  },
];
export const stationCopy: Record<
  InteractionId,
  {
    title: string;
    lines: string[];
    finish: string[];
    route: string;
    stamp: string;
    knowledge: string[];
  }
> = {
  lantern: {
    title: "亲手做一盏，\n晚上提着它走进徽州。",
    lines: ["轻轻覆上灯纸", "给它添一点颜色", "长按，点亮它"],
    finish: [
      "亲手做完，只是上半场。",
      "入夜，它会跟着孩子\n走进徽州的青石巷。",
    ],
    route: "DAY 2 · 鱼灯制作 → 唐模夜游",
    stamp: "灯火印",
    knowledge: [
      "亲手参与鱼灯制作，并在当晚进入唐模夜游。",
      "手作没有停留在“完成作品”，而进入真实节俗场景。",
      "DAY 2 · 徽州相关体验 → 唐模",
    ],
  },
  ink: {
    title: "有些中国文化，\n要靠手指离得很近\n才看得见。",
    lines: ["沿纹样，描下一笔金"],
    finish: [
      "在胡开文，不只是“看一块墨”。",
      "孩子会先认识它怎样被做出来，\n再亲手完成描金。",
      "从听见一个知识，到真正碰过它。",
    ],
    route: "DAY 2 · 徽州古城 → 胡开文 → 唐模",
    stamp: "墨香印",
    knowledge: [
      "认识徽墨制作工艺，亲手参与墨锭描金。",
      "从听见一个知识，到真正碰过它。",
      "DAY 2 · 徽州古城 → 胡开文 → 唐模",
    ],
  },
  year: {
    title: "这一次，\n不是在景区“看年俗”。",
    lines: ["轻移木槌，敲开一份年礼", "点一点朱红"],
    finish: [
      "你刚才不是看了一段年俗介绍。",
      "而是亲手把“年”，一步一步做出来。",
    ],
    route: "DAY 3 · 南屏 → 宏村",
    stamp: "年岁印",
    knowledge: [
      "在南屏体验食桃制作、写楹联与年宴，再前往宏村。",
      "年俗成为亲手参与、一起经历的生活片段。",
      "DAY 3 · 南屏 → 宏村",
    ],
  },
  macaque: {
    title: "现在，\n把“看见”变成“观察”。",
    lines: ["左右轻移调焦轮", "记录你的发现"],
    finish: [
      "看见一只动物很容易。",
      "学会观察，\n是另一件事。",
    ],
    route: "DAY 4 · 短尾猴观察 → 黄山",
    stamp: "山野印",
    knowledge: [
      "在短尾猴观察体验中，认识山林里的动物，练习观察与记录。",
      "让好奇心转为主动的观察，不编造研究结论。",
      "DAY 4 · 短尾猴观察 → 进入黄山",
    ],
  },
};
export const valueCopy = [
  { title: "孩子带走的", body: "不是几个知识点。\n是亲手做过、安静观察过，\n也真正问过。" },
  { title: "妈妈留下的", body: "不是一路陪同。\n是古戏台的一盏茶、\n山顶的一小时，\n也是一场自己的旅行。" },
  { title: "一家人共有的", body: "提着灯走过古巷，\n在老宅过年，\n再一起走进黄山冬雪。" },
];
