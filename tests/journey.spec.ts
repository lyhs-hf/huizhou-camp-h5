import { test, expect, type Page, type Locator } from "@playwright/test";
const labels = {
  culture: "亲手做过的中国文化",
  curiosity: "自己发现世界的好奇心",
  family: "一家人真正一起经历过的事",
};
async function scene(page: Page, id: number) {
  await expect(page.locator("main")).toHaveAttribute("data-scene", String(id));
  await page.waitForTimeout(560);
}
async function next(page: Page, id: number) {
  if (id === 10 && await page.getByRole("button", { name: "把这一小时，留给自己" }).count()) await motherMoment(page, "tea");
  await page.locator(".continue").click(); await scene(page, id);
}
async function open(page: Page) { await page.goto("./"); await scene(page, 1); }
async function trace(page: Page, locator: Locator, count = 100) {
  const points = await locator.evaluate((path: SVGPathElement, n: number) => {
    const m = path.getScreenCTM()!, length = path.getTotalLength();
    return Array.from({ length: n }, (_, i) => { const p = path.getPointAtLength(length * i / (n - 1)); const q = new DOMPoint(p.x, p.y).matrixTransform(m); return { x: q.x, y: q.y }; });
  }, count);
  await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  for (const p of points) await page.mouse.move(p.x, p.y);
  await page.mouse.up();
}
async function findMacaque(page: Page) {
  const b = await page.getByTestId("search-view").boundingBox(); if (!b) throw Error("No search viewport");
  await page.mouse.move(b.x + b.width * .65, b.y + b.height * .45); await page.mouse.down();
  await page.mouse.move(b.x + b.width * .65 - 105, b.y + b.height * .45 + 35, { steps: 25 }); await page.mouse.up();
  await expect(page.getByTestId("focus-wheel")).toBeVisible();
}
async function completeCore(page: Page, id: number) {
  if (id < 4 || id > 7 || await page.locator(".continue").count()) return;
  if (id === 4) {
    await drag(page, '[data-testid="paper"]', '[data-testid="lantern-target"]');
    const b = (await page.getByTestId("paint").boundingBox())!;
    await page.mouse.move(b.x + 25, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width - 25, b.y + b.height / 2, { steps: 25 }); await page.mouse.up();
    const l = (await page.getByRole("button", { name: "长按600毫秒点亮鱼灯" }).boundingBox())!;
    await page.mouse.move(l.x + l.width / 2, l.y + l.height / 2); await page.mouse.down(); await page.waitForTimeout(710); await page.mouse.up();
  } else if (id === 5) {
    const ink = page.getByTestId("ink-path"); await ink.press("ArrowRight"); await ink.press("Enter");
    for (let i = 0; i < 3; i++) await trace(page, page.locator(".trace-guide").nth(i));
    await expect(ink).toHaveAttribute("data-phase", "finish"); await ink.press("Enter");
  } else if (id === 6) {
    await drag(page, '[data-testid="rice-dough"]', '[data-testid="mould-target"]');
    await expect(page.getByTestId("mallet")).toBeVisible();
    for (let i = 0; i < 3; i++) { await drag(page, '[data-testid="mallet"]', ".year-image"); await page.waitForTimeout(380); }
    await page.getByRole("button", { name: "点一点朱红", exact: true }).click();
    await page.getByRole("button", { name: "轻推，走进天井" }).click();
    await page.getByRole("button", { name: "轻推，围坐年宴" }).click();
    await page.getByRole("button", { name: "把这一席年留在心里" }).click();
  } else {
    await findMacaque(page); await page.getByTestId("focus-wheel").press("End");
    await page.getByRole("button", { name: "它在做什么", exact: true }).click();
  }
  await expect(page.locator(".continue")).toBeVisible();
}
async function motherMoment(page: Page, choice: "tea" | "incense" | "view") {
  await page.getByRole("button", { name: "把这一小时，留给自己" }).click();
  await page.getByRole("button", { name: choice === "tea" ? "点茶" : choice === "incense" ? "篆香" : "什么都不做，只看山", exact: true }).click();
  const surface = page.getByTestId("mother-ritual");
  if (choice === "tea") {
    const b = (await surface.boundingBox())!;
    await page.mouse.move(b.x+b.width*.4,b.y+b.height*.71); await page.mouse.down();
    for (let i=0;i<20;i++) { await page.mouse.move(b.x+b.width*(i%2 ? .6 : .4),b.y+b.height*.71); await page.waitForTimeout(45); }
    await page.mouse.up();
  }
  else if (choice === "incense") await trace(page, page.locator(".incense-guide"));
  else {
    const points = await surface.evaluate((svg: SVGSVGElement) => { const m = svg.getScreenCTM()!; return [[30,80],[270,80],[30,165],[270,165],[30,250],[270,250]].map(([x,y]) => { const q = new DOMPoint(x,y).matrixTransform(m); return {x:q.x,y:q.y}; }); });
    await page.mouse.move(points[0].x, points[0].y); await page.mouse.down(); for (const p of points.slice(1)) await page.mouse.move(p.x,p.y,{steps:18}); await page.mouse.up();
  }
  await expect(page.locator(".private-moment")).toHaveClass(/engaged/);
  await page.getByRole("button", { name: "收好这一小时" }).click();
  await expect(page.locator(".rejoining")).toBeVisible();
  await expect(page.locator(".continue")).toBeVisible();
}
async function to(page: Page, target: number, choice: keyof typeof labels = "culture") {
  await open(page);
  for (let s = 1; s < target; s++) {
    if (s === 2) await page.getByRole("button", { name: new RegExp(labels[choice]) }).click();
    await completeCore(page, s); await next(page, s + 1);
  }
}
async function lead(page: Page) {
  await to(page, 10);
  await page.getByRole("button", { name: "获取完整营期资料" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
async function drag(page: Page, selector: string, targetSelector: string) {
  const a = await page.locator(selector).boundingBox();
  const b = await page.locator(targetSelector).boundingBox();
  if (!a || !b) throw Error("Missing drag boxes");
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 });
  await page.mouse.up();
}
test("01 首页加载与主视觉", async ({ page }) => {
  await open(page);
  await expect(
    page.getByRole("heading", { name: /把一个中国年/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "向上，启程" })).toBeVisible();
  expect(
    await page
      .locator(".hero-image")
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
});
test("02 启程与期待选择", async ({ page }) => {
  await open(page);
  await next(page, 2);
  await expect(page.locator(".continue")).toBeDisabled();
  await page.getByRole("button", { name: /亲手做过的中国文化/ }).click();
  await expect(page.locator(".continue")).toBeEnabled();
});
for (const [id, text] of [
  ["culture", "孩子不是“听过”"],
  ["curiosity", "重新开始提问"],
  ["family", "他还会不会记得这个冬天"],
] as const)
  test(`03-05 ${id}结果内容正确`, async ({ page }) => {
    await to(page, 10, id);
    await expect(page.getByTestId("result-card")).toContainText(text);
  });
test("06 鱼灯真实拖动、添色、600ms长按", async ({ page }) => {
  await to(page, 4);
  await drag(page, '[data-testid="paper"]', '[data-testid="lantern-target"]');
  const paint = page.getByTestId("paint");
  const b = await paint.boundingBox();
  if (!b) throw Error("No paint");
  await page.mouse.move(b.x + 35, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width - 35, b.y + b.height / 2, { steps: 25 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "长按600毫秒点亮鱼灯" }),
  ).toBeVisible();
  const button = await page
    .getByRole("button", { name: "长按600毫秒点亮鱼灯" })
    .boundingBox();
  if (!button) throw Error("No light button");
  await page.mouse.move(
    button.x + button.width / 2,
    button.y + button.height / 2,
  );
  await page.mouse.down();
  await page.waitForTimeout(710);
  await page.mouse.up();
  await expect(page.getByText("灯火印", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("data-scene", "4");
});
test("07 徽墨观察、三个SVG短段描金与收笔", async ({ page }) => {
  await to(page, 5); const ink = page.getByTestId("ink-path");
  const b = (await ink.boundingBox())!; await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.mouse.down(); await page.mouse.move(b.x+b.width/2+55,b.y+b.height/2,{steps:15}); await page.mouse.up();
  await expect(ink).toHaveAttribute("data-phase", "trace");
  for (let i=0;i<3;i++) {
    await trace(page,page.locator(".trace-guide").nth(i));
    await expect(page.locator(".gold-line").nth(i)).toHaveCSS("opacity","1");
    await expect(page.getByText("墨香印",{exact:true})).toHaveCount(0);
  }
  await expect(ink).toHaveAttribute("data-phase","finish");
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.mouse.down(); await page.mouse.move(b.x+b.width/2+65,b.y+b.height/2,{steps:15}); await page.mouse.up();
  await expect(ink).toHaveAttribute("data-phase","rest"); await expect(page.locator(".continue")).toHaveCount(0);
  await expect(page.getByText("墨香印",{exact:true})).toBeVisible();
});
test("08 米团入模、三次敲击、点朱与用户主动走进年里", async ({ page }) => {
  await to(page,6); await drag(page,'[data-testid="rice-dough"]','[data-testid="mould-target"]');
  await expect(page.getByTestId("mallet")).toBeVisible();
  for (let i=1;i<=3;i++) { await drag(page,'[data-testid="mallet"]','.year-image'); await expect(page.locator(".year-image")).toHaveAttribute("data-hits",String(i)); if(i<3) await expect(page.getByRole("button",{name:"点一点朱红",exact:true})).toHaveCount(0); await page.waitForTimeout(380); }
  await page.getByRole("button",{name:"点一点朱红",exact:true}).click();
  await expect(page.locator(".red-point")).toBeVisible(); await expect(page.getByText("年岁印",{exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"轻推，走进天井"})).toBeVisible(); await page.waitForTimeout(4000);
  await expect(page.locator(".year-caption")).toHaveText("写楹联");
  await page.getByRole("button",{name:"轻推，走进天井"}).click(); await page.waitForTimeout(1500);
  await expect(page.locator(".year-caption")).toHaveText("天井里的光");
  await page.getByRole("button",{name:"轻推，围坐年宴"}).click(); await expect(page.locator(".year-caption")).toContainText("年宴");
  await page.getByRole("button",{name:"把这一席年留在心里"}).click(); await expect(page.getByText("年岁印",{exact:true})).toBeVisible();
  await expect(page.locator(".water-route")).toContainText("南屏"); await expect(page.locator(".water-route")).toContainText("宏村");
});
test("09 寻找、调焦、三秒观察与中性记录", async ({ page }) => {
  await to(page,7); await expect(page.getByTestId("focus-wheel")).toHaveCount(0); await findMacaque(page);
  const b=(await page.getByTestId("focus-wheel").boundingBox())!; await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.mouse.down(); await page.mouse.move(b.x+b.width/2+158,b.y+b.height/2,{steps:20}); await page.mouse.up();
  await expect(page.locator(".observe-pause")).toBeVisible(); await expect(page.getByTestId("field-notebook")).toHaveCount(0); await page.waitForTimeout(2200); await expect(page.getByTestId("field-notebook")).toHaveCount(0);
  await expect(page.getByTestId("field-notebook")).toBeVisible(); await page.getByRole("button",{name:"它在做什么",exact:true}).click(); await expect(page.getByText("山野印",{exact:true})).toBeVisible();
});
test("10 四枚印记收录且返回不重复", async ({ page }) => {
  await to(page, 10, "culture");
  await expect(page.getByTestId("collected-stamp")).toHaveCount(4);
  await expect(page.locator(".result-stamps .collected")).toHaveCount(4);
  await expect(
    page.locator(".route-day").nth(1).getByTestId("collected-stamp"),
  ).toHaveText(["灯", "墨"]);
  await expect(
    page.locator(".route-day").nth(2).getByTestId("collected-stamp"),
  ).toHaveText("年");
  await expect(
    page.locator(".route-day").nth(3).getByTestId("collected-stamp"),
  ).toHaveText("山");
  for (let s = 9; s >= 7; s--) {
    await page.getByRole("button", { name: "返回上一幕" }).click();
    await scene(page, s);
  }
  await expect(page.getByText("山野印", { exact: true })).toBeVisible();
  for (let s = 8; s <= 10; s++) await next(page, s);
  await expect(page.getByTestId("collected-stamp")).toHaveCount(4);
});
test("11 Divider拖动且锁住全局手势", async ({ page }) => {
  await to(page, 9);
  const b = await page.getByTestId("divider").boundingBox();
  if (!b) throw Error("No divider");
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x - 70, b.y + b.height / 2 - 90, { steps: 15 });
  await page.mouse.up();
  expect(
    Number(await page.getByTestId("divider").getAttribute("aria-valuenow")),
  ).toBeLessThan(50);
  await expect(page.locator("main")).toHaveAttribute("data-scene", "9");
});
test("12 六日总览可完整查看", async ({ page }) => {
  await to(page, 10);
  await expect(page.locator(".route-day")).toHaveCount(6);
  await page
    .getByRole("heading", { name: "在云端结束这次旅程" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", { name: "在云端结束这次旅程" }),
  ).toBeVisible();
  await expect(page.locator(".full-route")).toContainText("黄梅戏相关文化体验");
});
test("13 结果PNG生成且达到3倍分辨率", async ({ page }) => {
  await to(page, 10);
  await page.getByRole("button", { name: "保存我的冬日行旅卷" }).click();
  const img = page.getByTestId("saved-image");
  await expect(img).toBeVisible();
  expect(
    await img.evaluate((el: HTMLImageElement) => el.naturalWidth),
  ).toBeGreaterThanOrEqual(990);
});
test("14 手机号为空拦截", async ({ page }) => {
  await lead(page);
  await page.getByRole("button", { name: "获取营期与完整资料" }).click();
  await expect(page.getByRole("alert")).toHaveText("请填写家长手机号");
});
test("15 手机号格式错误提示", async ({ page }) => {
  await lead(page);
  await page.getByLabel(/家长手机号/).fill("12345678901");
  await page.getByRole("button", { name: "获取营期与完整资料" }).click();
  await expect(page.getByRole("alert")).toHaveText("请填写正确的11位手机号");
});
test("16 合法Demo提交success", async ({ page }) => {
  await lead(page);
  await page.getByLabel(/家长手机号/).fill("13800000000");
  await page.getByLabel(/孩子年龄段/).selectOption("9–12岁");
  await page.getByRole("button", { name: "获取营期与完整资料" }).click();
  await expect(page.getByText("演示提交已完成。")).toBeVisible();
});
test("17 提交不持久化且无网络传送联系人", async ({ page }) => {
  await lead(page);
  const transmissions: string[] = [];
  page.on("request", (r) => {
    if (
      r.postData()?.includes("13800000000") ||
      r.url().includes("13800000000")
    )
      transmissions.push(r.url());
  });
  await page.getByLabel(/家长手机号/).fill("13800000000");
  await page.getByLabel(/孩子年龄段/).selectOption("5–8岁");
  await page.getByRole("button", { name: "获取营期与完整资料" }).click();
  await expect(page.getByText("演示提交已完成。")).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(transmissions).toEqual([]);
});
test("18 刷新不残留手机号", async ({ page }) => {
  await lead(page);
  await page.getByLabel(/家长手机号/).fill("13800000000");
  await page.reload();
  await scene(page, 1);
  for (let s = 1; s < 10; s++) {
    if (s === 2)
      await page.getByRole("button", { name: /亲手做过的中国文化/ }).click();
    await completeCore(page, s);
    await next(page, s + 1);
  }
  await page.getByRole("button", { name: "获取完整营期资料" }).click();
  await expect(page.getByLabel(/家长手机号/)).toHaveValue("");
});
for (const [width, height] of [
  [320, 568],
  [375, 812],
  [390, 844],
  [393, 852],
  [430, 932],
])
  test(`19-20 ${width}×${height}所有幕无溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await open(page);
    for (let s = 1; s <= 10; s++) {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const bounds = await page.locator(".scene-footer").count();
      if (bounds) {
        const footer = await page.locator(".scene-footer").boundingBox();
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(height + 1);
      }
      if (s === 2)
        await page.getByRole("button", { name: /亲手做过的中国文化/ }).click();
      if (s < 10) { await completeCore(page, s); await next(page, s + 1); }
    }
  });
test("21 reduced-motion保持完整可用", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await to(page, 10, "family");
  await expect(page.getByTestId("result-card")).toContainText("这个冬天");
  await expect(page.getByTestId("collected-stamp")).toHaveCount(4);
});
test("22 抽屉Esc与焦点恢复", async ({ page }) => {
  await to(page, 4);
  const trigger = page.getByRole("button", { name: /这一站，孩子在经历什么/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test("23 触屏点击和辅助路径可用", async ({ page }) => {
  await to(page, 4);
  await expect(page.getByRole("button", { name: "需要一点帮助？" })).toHaveCount(0);
  await page.getByRole("button", { name: "需要一点帮助？" }).tap();
  await page.getByRole("button", { name: "轻点，覆上灯纸" }).tap();
  await expect(page.getByTestId("paint")).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("data-scene", "4");
});

for (const id of [4,5,6,7]) test(`FINAL ${id}未完成禁止CTA/键盘跳过`, async ({page}) => {
  await to(page,id); await expect(page.locator(".continue")).toHaveCount(0);
  await page.keyboard.press("PageDown"); await page.waitForTimeout(600); await expect(page.locator("main")).toHaveAttribute("data-scene",String(id));
  await expect(page.getByRole("button",{name:"重新体验",exact:true})).toHaveCount(0);
});
test("FINAL 帮助入口在无阶段推进约8秒后才出现",async({page})=>{
  await to(page,4); await expect(page.getByRole("button",{name:"需要一点帮助？"})).toHaveCount(0); await page.waitForTimeout(6500);
  await expect(page.getByRole("button",{name:"需要一点帮助？"})).toHaveCount(0); await expect(page.getByRole("button",{name:"需要一点帮助？"})).toBeVisible();
});
test("FINAL 鱼灯两秒停留和妈妈的可选古戏台片刻",async({page})=>{
  await to(page,4); await completeCore(page,4); await page.getByRole("button",{name:"同一时间，看看妈妈这一刻"}).click();
  await expect(page.getByRole("dialog")).toBeVisible(); await expect(page.locator(".mother-interlude")).toContainText("一曲黄梅戏");
  await page.waitForTimeout(5600); await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".mother-leave").click();
  await expect(page.getByRole("dialog")).toHaveCount(0); await expect(page.locator("main")).toHaveAttribute("data-scene","4");
});
for (const choice of ["tea","incense","view"] as const) test(`FINAL 妈妈${choice}真实微体验及双画面合流`,async({page})=>{
  await to(page,9); await motherMoment(page,choice); await expect(page.locator(".parallel-reunion")).toContainText("也给自己一段旅行");
  await expect(page.locator(".child-view")).toHaveCSS("width",`${(await page.locator(".parallel-images").boundingBox())!.width/2}px`);
});
test("FINAL 黄山85%以上有1.5秒无催促停留",async({page})=>{
  await to(page,8); await page.getByRole("button",{name:"向上轻推，慢慢入云"}).click(); await expect(page.locator(".continue")).toHaveCount(0);
  await page.waitForTimeout(900); await expect(page.locator(".continue")).toHaveCount(0); await expect(page.locator(".continue")).toBeVisible();
});

for (const choice of ["tea", "incense", "view"] as const) test(`FINAL ${choice}完成后由用户决定离开`, async ({page}) => {
  await to(page,9);
  await page.getByRole("button",{name:"把这一小时，留给自己"}).click();
  await page.getByRole("button",{name:choice==="tea"?"点茶":choice==="incense"?"篆香":"什么都不做，只看山",exact:true}).click();
  const ritual = page.getByTestId("mother-ritual");
  if(choice==="view") {
    const b=(await ritual.boundingBox())!;
    for(let i=0;i<5;i++) { await page.mouse.move(b.x+b.width*.15,b.y+b.height*(.2+i*.14)); await page.mouse.down(); await page.mouse.move(b.x+b.width*.85,b.y+b.height*(.2+i*.14),{steps:15}); await page.mouse.up(); }
  } else { for(let i=0;i<3;i++) await ritual.press("Enter"); }
  await expect(page.locator(".private-moment")).toHaveClass(/engaged/);
  await expect(page.getByRole("button",{name:"收好这一小时"})).toHaveCount(0);
  await page.waitForTimeout(6500);
  await expect(page.locator(".private-moment")).toBeVisible();
  await expect(page.locator(".rejoining")).toHaveCount(0);
  await page.getByRole("button",{name:"收好这一小时"}).click();
  await expect(page.locator(".rejoining")).toBeVisible();
  await expect(page.locator(".continue")).toHaveCount(0);
  await expect(page.locator(".parallel-reunion")).toContainText("晚一点");
  await expect(page.locator(".continue")).toHaveCount(0);
  await expect(page.locator(".continue")).toBeVisible();
});
test("FINAL 全键盘手作与自定义焦点",async({page})=>{
  await to(page,4); await page.getByTestId("paper").press("Enter");
  for(let i=0;i<3;i++) await page.getByTestId("paint").press("Enter");
  await page.getByRole("button",{name:"长按600毫秒点亮鱼灯"}).press("Enter");
  await next(page,5); const ink=page.getByTestId("ink-path");
  await ink.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  await expect(ink).toHaveCSS("outline-style","none");
  await expect(page.locator(".ink-object")).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  expect(await page.locator(".ink-object").evaluate(el => getComputedStyle(el,"::after").backgroundColor)).toBe("rgb(94, 89, 81)");
  await ink.press("Enter"); for(let i=0;i<3;i++) await ink.press("Enter"); await ink.press("Enter");
  await expect(page.getByText("墨香印",{exact:true})).toBeVisible();
});

test("FINAL Closing键盘翻页只滚动不切幕",async({page})=>{
  await to(page,10); await page.keyboard.press("PageDown"); await page.waitForTimeout(350);
  await expect(page.locator("main")).toHaveAttribute("data-scene","10");
  expect(await page.locator(".scene-body-10").evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
});
test("FINAL 操作中不出现闲置帮助提示",async({page})=>{
  await to(page,4); const b=(await page.getByTestId("paper").boundingBox())!;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
  await page.waitForTimeout(8200);await expect(page.getByRole("button",{name:"需要一点帮助？"})).toHaveCount(0);
  await page.mouse.up();await expect(page.getByRole("button",{name:"需要一点帮助？"})).toHaveCount(0);
});
