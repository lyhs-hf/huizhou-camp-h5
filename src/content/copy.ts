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
    context: string;
    lines: string[];
    finish: string[];
    route: string;
    stamp: string;
    knowledge: string[];
  }
> = {
  lantern: {
    title: "亲手做一盏，\n晚上提着它走进徽州。",
    context: "在徽州古城，先把灯纸覆上骨架。入夜，带着自己做的灯走进唐模。",
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
    context: "在胡开文，先认识徽墨工艺，再为墨面凸起的纹样描金。",
    lines: ["沿纹样，描下一笔金"],
    finish: [
      "从听见一个知识，\n到真正碰过它。",
    ],
    route: "DAY 2 · 徽州古城 → 胡开文 → 唐模",
    stamp: "墨香印",
    knowledge: [
      "先认识徽墨工艺，再参与墨锭描金。这里描的是墨面装饰纹样，完整制墨仍由匠人完成。",
      "墨用来书写，墨面也有可细看的浮雕。试着问孩子：侧光下，哪一处纹样先被看见？",
      "DAY 2 · 徽州古城 → 胡开文 → 唐模",
    ],
  },
  year: {
    title: "在南屏，\n亲手做一份年礼。",
    context: "米粉入木模，敲出一份食桃。把祝愿写上红纸，再走进老宅的年宴。",
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
    context: "进入山林，先找到一个身影，再看清它的身体与落脚处。",
    lines: ["左右轻移调焦轮", "记录你的发现"],
    finish: [
      "观察，不只是多看一会儿。",
      "是知道自己在找什么。",
    ],
    route: "DAY 4 · 短尾猴观察 → 黄山",
    stamp: "山野印",
    knowledge: [
      "在山林体验中练习观察与记录。本页用意境画面练习方法，真实山林里的发现每次都不同。",
      "先描述能看见的姿态和环境，再提出想了解的问题。坐在岩石上是描述；为什么停在这里，需要继续观察。",
      "DAY 4 · 短尾猴观察 → 进入黄山",
    ],
  },
};
export const valueCopy = [
  { title: "孩子带走的", body: "一盏亲手做的灯，\n一笔墨面金纹，\n一次带着问题的山林观察。" },
  { title: "妈妈留下的", body: "古戏台的一盏茶，\n山顶属于自己的一小时。" },
  { title: "一家人共有的", body: "提着灯走过古巷，\n在老宅过年，\n再一起走进黄山冬雪。" },
];
