import { test, expect, type Page, type Locator } from "@playwright/test";
const labels = {
  culture: "亲手做过的中国文化",
  curiosity: "自己发现世界的好奇心",
  family: "一家人真正一起经历过的事",
};
async function scene(page: Page, id: number) {
  await expect(page.locator("main")).toHaveAttribute("data-scene", String(id));
  await expect(page.getByTestId("film-transition")).toHaveCount(0);
  await page.waitForTimeout(560);
}
async function next(page: Page, id: number) {
  if (id === 10 && await page.getByRole("button", { name: "把这一小时，留给自己" }).count()) await motherMoment(page, "tea");
  if (id === 9) await arrive(page);
  await page.locator(".continue, .scene-departure").click(); await scene(page, id);
}
async function open(page: Page) { await page.goto("./"); await scene(page, 1); }
async function fixedSceneFit(page: Page) {
  const issues=await page.evaluate(()=>{
    const main=document.querySelector('main')!,bounds=main.getBoundingClientRect();
    const fixed=main.getAttribute('data-scene')!=='10';
    const selectors='h1:not(.sr-only),.stage-hint,.forest-invitation,.forest-caption,.cloud-invitation,.arrival-caption,.parallel-whisper,.divider-hint,.scene-departure,.mother-enter,.moment-note,.keep-moment,.scene-reason,.scene-afterword,.year-caption,.year-step,.parallel-reunion,.observation-page,.mother-slips';
    const problems:string[]=[];
    for(const el of main.querySelectorAll<HTMLElement>(selectors)){
      const box=el.getBoundingClientRect(),style=getComputedStyle(el);
      if(box.width<2||box.height<2||style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<.05||el.closest('[aria-hidden="true"]'))continue;
      const label=(el.textContent||el.className).trim().slice(0,34);
      if(el.scrollWidth>el.clientWidth+1)problems.push(label+': text overflow');
      const range=document.createRange();range.selectNodeContents(el);
      for(const r of range.getClientRects()){
        if(r.width<1||r.height<1)continue;
        if(r.left<bounds.left-1||r.right>bounds.right+1||(fixed&&(r.top<bounds.top-1||r.bottom>bounds.bottom+1))){problems.push(label+': clipped at screen edge');break;}
      }
    }
    return problems;
  });
  expect(issues).toEqual([]);
}

async function trace(page: Page, locator: Locator, count = 100) {
  const points = await locator.evaluate((path: SVGPathElement, n: number) => {
    const m = path.getScreenCTM()!, length = path.getTotalLength();
    return Array.from({ length: n }, (_, i) => { const p = path.getPointAtLength(length * i / (n - 1)); const q = new DOMPoint(p.x, p.y).matrixTransform(m); return { x: q.x, y: q.y }; });
  }, count);
  await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  for (const p of points) await page.mouse.move(p.x, p.y);
  await page.mouse.up();
}
async function roomForward(page: Page) {
  const box = (await page.locator(".year-page-gesture").boundingBox())!;
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .45);
  await page.mouse.down(); await page.mouse.move(box.x + box.width * .2, box.y + box.height * .45, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(1200);
}
async function arrive(page: Page) {
  const camera=page.getByTestId("cloud-camera");
  if(await page.locator('.cloud-arrival').getAttribute('data-shot')==='near') {
    const b=(await camera.boundingBox())!;
    await page.mouse.move(b.x+b.width*.55,b.y+b.height*.75);await page.mouse.down();
    await page.mouse.move(b.x+b.width*.55,b.y+b.height*.5,{steps:20});await page.mouse.up();
  }
  await expect(page.locator('.arrival-settled')).toBeVisible();
}
async function unfoldPaper(page: Page) {
  const b=(await page.getByTestId('red-paper').boundingBox())!;
  await page.mouse.move(b.x+55,b.y+25);await page.mouse.down();
  await page.mouse.move(b.x+85,b.y+135,{steps:12});await page.mouse.up();
  await expect(page.locator('.year-page-gesture')).toBeVisible();
}
async function findMacaque(page: Page) {
  const surface=page.getByTestId('forest-view'),b=(await surface.boundingBox())!;
  for(let n=0;n<5 && await page.locator('.forest-observation').getAttribute('data-found')==='false';n++) {
    await page.mouse.move(b.x+b.width*.86,b.y+b.height*.48);await page.mouse.down();
    await page.mouse.move(b.x+b.width*.14,b.y+b.height*.48,{steps:25});await page.mouse.up();
  }
  await expect(page.locator('.forest-observation')).toHaveAttribute('data-found','true');
  await page.waitForTimeout(1300);
}
async function notice(page: Page, detail: 'body'|'rock'|'pine') {
  const b=(await page.getByTestId('forest-view').boundingBox())!,r=(await page.locator(`[data-detail="${detail}"]`).boundingBox())!;
  const x=Math.max(b.x+16,Math.min(b.x+b.width-16,r.x+r.width/2));
  const y=Math.max(b.y+16,Math.min(b.y+b.height-40,r.y+r.height/2));
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+8,y+20,{steps:5});await page.mouse.up();
}
async function quietTea(page: Page) {
  const points=await page.getByTestId('mother-ritual').evaluate((svg:SVGSVGElement)=>{
    const m=svg.getScreenCTM()!;
    return Array.from({length:33},(_,i)=>{const a=Math.PI*2*i/32,p=new DOMPoint(150+32*Math.cos(a),220+10*Math.sin(a)).matrixTransform(m);return{x:p.x,y:p.y};});
  });
  await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();
  for(const p of points){await page.mouse.move(p.x,p.y);await page.waitForTimeout(25);}
  await page.mouse.up();
}
async function completeCore(page: Page, id: number) {
  if (id < 4 || id > 7 || await page.locator(".continue, .scene-departure").count()) return;
  if (id === 4) {
    await drag(page, '[data-testid="paper"]', '[data-testid="lantern-target"]');
    const b = (await page.getByTestId("paint").boundingBox())!;
    await page.mouse.move(b.x + 25, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width - 25, b.y + b.height / 2, { steps: 25 }); await page.mouse.up();
    const l = (await page.getByRole("button", { name: "长按600毫秒点亮鱼灯" }).boundingBox())!;
    await page.mouse.move(l.x + l.width / 2, l.y + l.height / 2); await page.mouse.down(); await page.waitForTimeout(710); await page.mouse.up();
  } else if (id === 5) {
    const ink=page.getByTestId('ink-path'),b=(await ink.boundingBox())!;
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
    await page.mouse.move(b.x+b.width/2+55,b.y+b.height/2,{steps:15});await page.mouse.up();
    for(let i=0;i<3;i++)await trace(page,page.locator('.trace-guide').nth(i));
  } else if (id === 6) {
    await drag(page, '[data-testid="rice-dough"]', '[data-testid="mould-target"]');
    await expect(page.getByTestId("mallet")).toBeVisible();
    for (let i = 0; i < 3; i++) { await drag(page, '[data-testid="mallet"]', '[data-testid="mould-target"]'); await page.waitForTimeout(380); }
    await page.getByRole("button", { name: "点一点朱红", exact: true }).click();
    await page.getByTestId("red-paper").waitFor(); await unfoldPaper(page);
    await expect(page.locator(".year-page-gesture")).toBeVisible();
    await roomForward(page); await roomForward(page);
    await page.getByRole("button", { name: "把这一席年留在心里" }).click();
  } else {
    await findMacaque(page);await notice(page,'body');await notice(page,'rock');
    await page.getByRole('button',{name:'收起这页札记'}).click();
  }
  await expect(page.locator(".continue, .scene-departure")).toBeVisible();
}
async function motherMoment(page: Page, choice: "tea" | "incense" | "view") {
  await page.getByRole("button", { name: "把这一小时，留给自己" }).click();
  await page.getByRole("button", { name: choice === "tea" ? "点茶" : choice === "incense" ? "篆香" : "什么都不做，只看山", exact: true }).click();
  await expect(page.getByTestId("film-transition")).toHaveCount(0);
  if (choice === "tea") {
    await quietTea(page);
  }
  else if (choice === "incense") await trace(page, page.locator(".incense-guide"));
  else await expect(page.getByTestId("mother-ritual")).toHaveCount(0);
  await expect(page.locator(".private-moment")).toHaveClass(/engaged/);
  await page.getByRole("button", { name: "收好这一小时" }).click();
  await expect(page.locator(".rejoining")).toBeVisible();
  await expect(page.locator(".continue, .scene-departure")).toBeVisible();
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
  await expect(page.locator(".continue, .scene-departure")).toBeDisabled();
  await page.getByRole("button", { name: /亲手做过的中国文化/ }).click();
  await expect(page.locator(".continue, .scene-departure")).toBeEnabled();
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
  await expect(page.locator(".lantern-stage.phase-3")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".scene-afterword")).toContainText("徽州的夜");
  await expect(page.locator(".stamp-mark")).toHaveCount(0);
  await expect(page.locator("main")).toHaveAttribute("data-scene", "4");
});
test("07 指尖留下局部金纹，成品自动进入静观而非收笔任务",async({page})=>{
  await to(page,5);const ink=page.getByTestId('ink-path');await ink.press('Enter');
  const points=await page.locator('.trace-guide').first().evaluate((p:SVGPathElement)=>{const m=p.getScreenCTM()!,l=p.getTotalLength();return[.03,.15].map(t=>{const q=p.getPointAtLength(l*t),r=new DOMPoint(q.x,q.y).matrixTransform(m);return{x:r.x,y:r.y};});});
  await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.mouse.move(points[1].x,points[1].y,{steps:8});await page.mouse.up();
  const count=await page.locator('#ink-leaf-0 circle').count();expect(count).toBeGreaterThan(0);expect(count).toBeLessThan(30);
  for(let i=0;i<3;i++)await trace(page,page.locator('.trace-guide').nth(i));
  await expect(ink).toHaveAttribute('data-phase','rest');await expect(page.locator('.scene-departure')).toHaveCount(0);
  await expect(page.locator('.scene-afterword')).toContainText('真正碰过它');
  for(let i=0;i<3;i++)expect(await page.locator(`#ink-leaf-${i} circle`).count()).toBeGreaterThanOrEqual(30);
  await expect(page.locator('.ink-progress')).toHaveCount(0);await expect(page.locator('.stamp-mark')).toHaveCount(0);
  const marks=await page.locator('mask[id^="ink-leaf-"]').evaluateAll(nodes=>nodes.map(n=>Array.from(n.querySelectorAll('circle')).map(c=>[c.getAttribute('cx'),c.getAttribute('cy')])));
  await next(page,6);await page.getByRole('button',{name:'返回上一幕'}).click();await scene(page,5);
  await expect(page.getByTestId('ink-path')).toHaveAttribute('data-phase','done');
  expect(await page.locator('mask[id^="ink-leaf-"]').evaluateAll(nodes=>nodes.map(n=>Array.from(n.querySelectorAll('circle')).map(c=>[c.getAttribute('cx'),c.getAttribute('cy')])))).toEqual(marks);
});
test("徽墨一笔连续跨过全部凸纹，不被隐藏分段中断", async ({ page }) => {
  await to(page, 5);
  const ink = page.getByTestId("ink-path");
  const b = (await ink.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 55, b.y + b.height / 2, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(1200);
  const points = await page.locator(".trace-guide").evaluateAll(paths => paths.flatMap(path => {
    const p = path as SVGPathElement, m = p.getScreenCTM()!, length = p.getTotalLength();
    return Array.from({ length: 25 }, (_, i) => {
      const q = p.getPointAtLength(length * i / 24), r = new DOMPoint(q.x, q.y).matrixTransform(m);
      return { x: r.x, y: r.y };
    });
  }));
  await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  for (const point of points) await page.mouse.move(point.x, point.y);
  await page.mouse.up();
  await expect(ink).toHaveAttribute("data-phase", "rest");
  await expect(page.getByRole("button", { name: "墨香里，走进徽州年" })).toBeVisible();
  await next(page, 6);
});
test("徽墨从上端描起、取消再续画，文字长按不夺走手势", async ({ page, browserName }) => {
  await to(page, 5);
  const ink = page.getByTestId("ink-path"); await ink.press("Enter");
  await expect(page.locator(".stage-hint")).toContainText("可以抬手接着描");
  const protection = await page.locator(".stage-hint").evaluate(el => ({
    select: getComputedStyle(el).userSelect,
    webkit: getComputedStyle(el).getPropertyValue("-webkit-user-select"),
    callout: getComputedStyle(el).getPropertyValue("-webkit-touch-callout"),
    supportsCallout: CSS.supports("-webkit-touch-callout", "none"),
  }));
  expect(protection.select).toBe("none");
  if (browserName === "webkit") expect(protection.webkit).toBe("none");
  if (protection.supportsCallout) expect(protection.callout).toBe("none");
  expect(await ink.evaluate(el => !el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })))).toBe(true);
  // Genuine hold / drag across the hint must not create a document selection.
  const hint = (await page.locator(".stage-hint").boundingBox())!;
  await page.mouse.move(hint.x + 10, hint.y + hint.height / 2); await page.mouse.down();
  await page.waitForTimeout(850); await page.mouse.move(hint.x + hint.width - 10, hint.y + hint.height / 2, { steps: 5 }); await page.mouse.up();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe("");
  // The upper relief is usable before the lower one; cancellation keeps ink.
  await trace(page, page.locator(".trace-guide").nth(2), 8);
  expect(await page.locator("#ink-leaf-2 circle").count()).toBeGreaterThanOrEqual(30);
  const b = (await ink.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await ink.dispatchEvent("pointercancel", { pointerId: 1, bubbles: true }); await page.mouse.up();
  await trace(page, page.locator(".trace-guide").nth(1), 8);
  await trace(page, page.locator(".trace-guide").nth(0), 8);
  await expect(page.getByRole("button", { name: "墨香里，走进徽州年" })).toBeVisible();
  await next(page, 6);
});
test("行旅音乐由启程手势播放、静音跨幕保留且刷新不自动播放", async ({ page }) => {
  await open(page);
  const music = page.getByTestId("journey-bgm");
  expect(await music.getAttribute("src")).toBeNull();
  await next(page, 2);
  const toggle = page.getByRole("button", { name: "关闭背景音乐" });
  await expect(toggle).toHaveAttribute("data-playing", "true");
  const before = await music.evaluate((audio: HTMLAudioElement) => ({ time: audio.currentTime, loop: audio.loop, paused: audio.paused, duration: audio.duration }));
  expect(before.loop).toBe(true); expect(before.paused).toBe(false); expect(before.duration).toBeGreaterThan(90);
  await expect.poll(() => music.evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(1.5);
  await toggle.click(); await expect(page.getByRole("button", { name: "开启背景音乐" })).toHaveAttribute("data-playing", "false");
  const pausedTime = await music.evaluate((audio: HTMLAudioElement) => audio.currentTime);
  await page.getByRole("button", { name: /亲手做过的中国文化/ }).click(); await next(page, 3);
  expect(await music.evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  await page.getByRole("button", { name: "开启背景音乐" }).click();
  await expect(page.getByRole("button", { name: "关闭背景音乐" })).toHaveAttribute("data-playing", "true");
  // WebKit's audio device clock can settle by a few milliseconds on resume.
  expect(Math.abs(await music.evaluate((audio: HTMLAudioElement) => audio.currentTime) - pausedTime)).toBeLessThan(.2);
  await page.reload(); await scene(page, 1);
  expect(await music.getAttribute("src")).toBeNull();
});
for (const width of [375, 390, 430]) {
  test(`徽墨 ${width}px 普通稀疏拖动可完成，落笔和偏离纹样不会跳过`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 430 ? 932 : width === 390 ? 844 : 812 });
    await to(page, 5);
    const ink = page.getByTestId("ink-path");
    await ink.press("Enter");
    const b = (await ink.boundingBox())!;
    await page.mouse.click(b.x + 12, b.y + 12);
    await page.mouse.move(b.x + 12, b.y + 12); await page.mouse.down();
    await page.mouse.move(b.x + 12, b.y + b.height - 12, { steps: 4 }); await page.mouse.up();
    await expect(page.locator("#ink-leaf-0 circle")).toHaveCount(0);
    await expect(ink).toHaveAttribute("data-phase", "trace");
    for (let i = 0; i < 3; i++) {
      // Eight samples model an ordinary short drag, rather than 100 exact points.
      await trace(page, page.locator(".trace-guide").nth(i), 8);
      await expect(page.locator(".gold-line").nth(i)).toHaveCSS("opacity", "1");
    }
    await expect(ink).toHaveAttribute("data-phase", "rest");
    await expect(page.locator(".scene-departure")).toHaveCount(0);
    await expect(page.locator(".scene-afterword")).toContainText("真正碰过它");
  });
}
test("08 年礼材料、红纸展开、墨迹与老宅连续空间",async({page,browserName})=>{
  await to(page,6);
  const dough=page.getByTestId('rice-dough'),db=(await dough.boundingBox())!;
  await expect(dough.locator('img')).toHaveCount(0);
  await page.mouse.move(db.x+db.width/2,db.y+db.height/2);await page.mouse.down();
  await page.mouse.move(db.x+db.width/2+30,db.y+db.height/2-30,{steps:5});
  await dough.dispatchEvent('pointercancel',{pointerId:1,bubbles:true});await page.mouse.up();
  await expect(page.locator('.year-image')).toHaveAttribute('data-phase','dough');
  const touchInput=browserName==='chromium'?await page.context().newCDPSession(page):null;
  async function craftDrag(from:string) {
    if(!touchInput){await drag(page,from,'[data-testid="mould-target"]');return;}
    const a=(await page.locator(from).boundingBox())!,b=(await page.getByTestId('mould-target').boundingBox())!;
    await touchInput.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2,id:1}]});
    for(let i=1;i<=12;i++)await touchInput.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(a.x+a.width/2)*(1-i/12)+(b.x+b.width/2)*i/12,y:(a.y+a.height/2)*(1-i/12)+(b.y+b.height/2)*i/12,id:1}]});
    await touchInput.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  await craftDrag('[data-testid="rice-dough"]');await expect(page.getByTestId('mallet')).toBeVisible();
  await expect(page.locator('.mould-rice foreignObject')).toHaveCount(0);
  const formed=await page.locator('.mould-rice .rice-material > path').first().getAttribute('d');
  for(let i=1;i<=3;i++){await craftDrag('[data-testid="mallet"]');await expect(page.locator('.year-image')).toHaveAttribute('data-hits',String(i));await page.waitForTimeout(380);}
  await expect(page.locator('.year-image')).toHaveAttribute('data-phase','red');
  await expect(page.locator('.crafted-peach .rice-material > path').first()).toHaveAttribute('d',formed!);
  const red=page.getByRole('button',{name:'点一点朱红',exact:true}),rb=(await red.boundingBox())!,pb=(await page.locator('.crafted-peach').boundingBox())!;
  expect(Math.abs(rb.x+rb.width/2-pb.x-pb.width/2)).toBeLessThan(22);
  expect(Math.abs(rb.y+rb.height/2-pb.y-pb.height/2)).toBeLessThan(22);
  await red.click();await expect(page.locator('.crafted-peach .rice-vermilion')).toBeVisible();
  await expect(page.getByTestId('red-paper')).toBeVisible();await expect(page.getByRole('button',{name:'平安常伴',exact:true})).toHaveCount(0);
  await expect(page.locator('.spring-brush').first()).toHaveCSS('stroke-dashoffset','180px');
  await unfoldPaper(page);await expect(page.locator('.spring-brush').last()).toHaveCSS('stroke-dashoffset','0px');
  await expect(page.locator(".room-camera mask")).toHaveCount(2);
  await roomForward(page);await expect(page.locator('.year-caption')).toContainText('天井里的光');await expect(page.locator('.director-paper')).toHaveClass(/at-door/);
  await roomForward(page);await expect(page.locator('.year-caption')).toContainText('年宴');await page.getByRole('button',{name:'把这一席年留在心里'}).click();
  await expect(page.locator('.scene-afterword')).toContainText('一家人的年');await expect(page.locator('.stamp-mark')).toHaveCount(0);
  await touchInput?.detach();
});
test("09 移动真实视野发现，只有看过的细节进入札记",async({page})=>{
  await to(page,7);await expect(page.getByRole('slider')).toHaveCount(0);
  const view=page.getByTestId('forest-view'),b=(await view.boundingBox())!;
  await page.mouse.move(b.x+200,b.y+400);await page.mouse.down();await view.dispatchEvent('pointercancel',{pointerId:1,bubbles:true});await page.mouse.up();
  await expect(page.locator('.forest-observation')).toHaveAttribute('data-found','false');
  await findMacaque(page);await page.waitForTimeout(3500);await expect(page.getByTestId('field-notebook')).toHaveCount(0);
  await notice(page,'body');await expect(page.getByTestId('field-notebook')).toHaveCount(0);await notice(page,'rock');await fixedSceneFit(page);
  await expect(page.getByTestId('field-notebook')).toContainText('前肢收在身前');await expect(page.getByTestId('field-notebook')).toContainText('边缘留着残雪');
  await expect(page.getByTestId('field-notebook')).not.toContainText('松枝伸进了视野');
  await expect(page.getByTestId('field-notebook').getByRole('button')).toHaveCount(1);
  await page.getByLabel('还有一个问题').fill('它还会走到哪里？');await page.getByRole('button',{name:'收起这页札记'}).click();
  await expect(page.locator('.forest-conclusion')).toBeVisible();await expect(page.locator('.scene-departure')).toBeVisible();
});
test("10 四枚印记收录且返回不重复", async ({ page }) => {
  test.setTimeout(150000);
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
  await expect(page.locator(".forest-conclusion")).toBeVisible();
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
  expect(await img.evaluate(el=>!el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true})))).toBe(false);
  if(await img.evaluate(()=>CSS.supports('-webkit-touch-callout','none'))) {
    expect(await img.evaluate(el=>getComputedStyle(el).getPropertyValue('-webkit-touch-callout'))).toBe('default');
  }
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
  // Two complete journeys include every material and emotional pause.
  test.setTimeout(180000);
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
      await fixedSceneFit(page);
      if (s === 2)
        await page.getByRole("button", { name: /亲手做过的中国文化/ }).click();
      if (s < 10) { await completeCore(page, s); await fixedSceneFit(page); await next(page, s + 1); }
    }
  });
for (const [width, height] of [[375, 812], [390, 844], [430, 932]]) test(`21 reduced-motion ${width}px 保持完整可用`, async ({ page }) => {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await to(page, 10, "family");
  await expect(page.getByTestId("result-card")).toContainText("这个冬天");
  await expect(page.getByTestId("collected-stamp")).toHaveCount(4);
});
test("22 抽屉Esc与焦点恢复", async ({ page }) => {
  await to(page, 4);
  await page.getByRole("button",{name:"更多体验选项"}).click();
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
  await page.getByRole("button", { name: "更多体验选项" }).tap();
  await page.getByRole("button", { name: "轻点，覆上灯纸" }).tap();
  await expect(page.getByTestId("paint")).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("data-scene", "4");
});

for (const id of [4,5,6,7]) test(`FINAL ${id}未完成禁止CTA/键盘跳过`, async ({page}) => {
  await to(page,id); await expect(page.locator(".continue, .scene-departure")).toHaveCount(0);
  await page.keyboard.press("PageDown"); await page.waitForTimeout(600); await expect(page.locator("main")).toHaveAttribute("data-scene",String(id));
  await expect(page.getByRole("button",{name:"重新体验",exact:true})).toHaveCount(0);
});
test("FINAL 帮助入口在无阶段推进约8秒后才出现",async({page})=>{
  await to(page,4); await expect(page.getByRole("button",{name:"需要一点帮助？"})).toHaveCount(0); await page.waitForTimeout(6500);
  await expect(page.getByRole("button",{name:"需要一点帮助？"})).toHaveCount(0); await expect(page.getByRole("button",{name:"更多体验选项"})).toBeVisible();
});
test("FINAL 鱼灯夜巷停留和妈妈的可选古戏台片刻",async({page})=>{
  await to(page,4); await completeCore(page,4); await page.getByRole("button",{name:"同一时间，看看妈妈这一刻"}).click();
  await expect(page.getByRole("dialog")).toBeVisible(); await expect(page.locator(".mother-interlude")).toContainText("一曲黄梅戏");
  await page.waitForTimeout(5600); await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".mother-leave").click();
  await expect(page.getByRole("dialog")).toHaveCount(0); await expect(page.locator("main")).toHaveAttribute("data-scene","4");
});
for (const choice of ["tea","incense","view"] as const) test(`FINAL 妈妈${choice}真实微体验及双画面合流`,async({page})=>{
  await to(page,9); await motherMoment(page,choice); await expect(page.locator(".parallel-reunion")).toContainText("也给自己一段旅行");
  await expect(page.locator(".reunion-window")).toBeVisible(); await expect(page.locator(".private-moment")).toHaveCount(0);
});
test("FINAL 黄山仅上推一次穿云，取消安全且完整群峰后三秒无UI",async({page})=>{
  await to(page,8);const camera=page.getByTestId('cloud-camera'),b=(await camera.boundingBox())!;
  await page.waitForTimeout(1000);await expect(page.locator('.cloud-arrival')).toHaveAttribute('data-shot','near');await expect(page.getByRole('slider')).toHaveCount(0);
  await page.mouse.move(b.x+200,b.y+600);await page.mouse.down();await page.mouse.move(b.x+200,b.y+490,{steps:8});await camera.dispatchEvent('pointercancel',{pointerId:1,bubbles:true});await page.mouse.up();
  await expect(page.locator('.cloud-arrival')).toHaveAttribute('data-shot','near');
  // Measure the rendered quiet interval in the browser. Protocol polling can
  // observe "summit" late on a busy runner; sleeps after that poll drift.
  const quietAudit = page.evaluate(() => new Promise<{ milliseconds: number; interruptions: string[] }>((resolve, reject) => {
    const world = document.querySelector('.cloud-arrival')!;
    let clearAt = 0, frame = 0;
    const interruptions = new Set<string>();
    const timeout = setTimeout(() => { observer.disconnect(); cancelAnimationFrame(frame); reject(new Error('No cloud arrival caption within 15 seconds')); }, 15000);
    const sample = () => {
      if (world.getAttribute('data-shot') !== 'summit') return;
      const cloud = document.querySelector('.arrival-cloud')!;
      if (Number(getComputedStyle(cloud).opacity) <= .01) {
        clearAt ||= performance.now();
        for (const selector of ['.arrival-caption', '.scene-departure', '.edge-back']) {
          const ui = document.querySelector(selector);
          if (ui && Number(getComputedStyle(ui).opacity) > .01) interruptions.add(selector);
        }
      }
      frame = requestAnimationFrame(sample);
    };
    const observer = new MutationObserver(() => {
      const shot = world.getAttribute('data-shot');
      if (shot === 'summit' && !frame) frame = requestAnimationFrame(sample);
      if (shot === 'caption') {
        clearTimeout(timeout); cancelAnimationFrame(frame); observer.disconnect();
        resolve({ milliseconds: clearAt ? performance.now() - clearAt : 0, interruptions: [...interruptions] });
      }
    });
    observer.observe(world, { attributes: true, attributeFilter: ['data-shot'] });
  }));
  await page.mouse.move(b.x+200,b.y+600);await page.mouse.down();await page.mouse.move(b.x+200,b.y+380,{steps:20});await page.mouse.up();
  const quiet = await quietAudit;
  expect(quiet.milliseconds).toBeGreaterThanOrEqual(3000);
  expect(quiet.interruptions).toEqual([]);
  await expect(page.locator('.arrival-settled')).toBeVisible();await expect(page.locator('.arrival-caption')).toContainText('从徽州人间');
});

for (const choice of ["tea", "incense", "view"] as const) test(`FINAL ${choice}完成后由用户决定离开`, async ({page}) => {
  await to(page,9);
  await page.getByRole("button",{name:"把这一小时，留给自己"}).click();
  await page.getByRole("button",{name:choice==="tea"?"点茶":choice==="incense"?"篆香":"什么都不做，只看山",exact:true}).click();
  const ritual = page.getByTestId("mother-ritual");
  if(choice==="view") await expect(ritual).toHaveCount(0);
  else { for(let i=0;i<3;i++) await ritual.press("Enter"); }
  await expect(page.locator(".private-moment")).toHaveClass(/engaged/);
  await expect(page.getByRole("button",{name:"收好这一小时"})).toHaveCount(0);
  await page.waitForTimeout(6500);
  await expect(page.locator(".private-moment")).toBeVisible();
  await expect(page.locator(".rejoining")).toHaveCount(0);
  await page.getByRole("button",{name:"收好这一小时"}).click();
  await expect(page.locator(".rejoining")).toBeVisible();
  await expect(page.locator(".continue, .scene-departure")).toHaveCount(0);
  await expect(page.locator(".parallel-reunion")).toContainText("晚一点");
  await expect(page.locator(".continue, .scene-departure")).toHaveCount(0);
  await expect(page.locator(".continue, .scene-departure")).toBeVisible();
});
test("FINAL 全键盘手作与自定义焦点",async({page})=>{
  await to(page,4); await page.getByTestId("paper").press("Enter");
  for(let i=0;i<3;i++) await page.getByTestId("paint").press("Enter");
  await page.getByRole("button",{name:"长按600毫秒点亮鱼灯"}).press("Enter");
  await expect(page.locator(".scene-departure")).toBeVisible();
  await page.getByRole("button",{name:"同一时间，看看妈妈这一刻"}).click();
  await expect(page.getByRole("dialog")).toBeVisible();await page.locator(".mother-leave").click();
  await next(page,5); const ink=page.getByTestId("ink-path");
  await ink.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  await expect(ink).toHaveCSS("outline-style","none");
  await expect(page.locator(".ink-object")).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  expect(await page.locator(".ink-object").evaluate(el => getComputedStyle(el,"::after").backgroundColor)).toBe("rgb(94, 89, 81)");
  await ink.press("Enter"); for(let i=0;i<3;i++) await ink.press("Enter"); await ink.press("Enter");
  await expect(page.locator(".scene-afterword")).toContainText("真正碰过它");
  await next(page,6);await page.getByTestId('rice-dough').press('Enter');await expect(page.getByTestId('mallet')).toBeVisible();
  for(let i=0;i<3;i++){await page.getByTestId('mallet').press('Enter');await page.waitForTimeout(400);}
  await page.getByRole('button',{name:'点一点朱红',exact:true}).click();await page.getByTestId('red-paper').press('Enter');
  await expect(page.locator('.year-page-gesture')).toBeVisible();for(let i=0;i<2;i++){await page.locator('.year-page-gesture').press('ArrowRight');await page.waitForTimeout(1200);}
  await page.getByRole('button',{name:'把这一席年留在心里'}).click();await expect(page.locator('.scene-departure')).toBeVisible();
  await next(page,7);const forest=page.getByTestId('forest-view');for(let i=0;i<8 && await page.locator('.forest-observation').getAttribute('data-found')==='false';i++){await forest.press('ArrowRight');await page.waitForTimeout(100);}
  await expect(page.locator('.forest-observation')).toHaveAttribute('data-found','true');await page.waitForTimeout(1300);
  for(let i=0;i<4 && await page.getByTestId('field-notebook').count()===0;i++){await forest.press('ArrowDown');await page.waitForTimeout(120);}
  await page.getByRole('button',{name:'收起这页札记'}).click();await next(page,8);await page.getByTestId('cloud-camera').press('ArrowUp');await expect(page.locator('.arrival-settled')).toBeVisible();

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

for (const [width, height] of [[375, 812], [390, 844], [430, 932]]) {
  for (const delay of [0, 100]) test(`FINAL 篆香 ${width}px ${delay ? "慢速" : "快速"}稀疏触点连续覆盖`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await to(page, 9);
    await page.getByRole("button", { name: "把这一小时，留给自己" }).click();
    await page.getByRole("button", { name: "篆香", exact: true }).click();
    const surface = page.getByTestId("mother-ritual");
    const corners = await surface.evaluate((svg: SVGSVGElement) => {
      const m = svg.getScreenCTM()!;
      return [[390,535],[333,535],[333,512],[446,512],[446,561],[307,561],[307,486],[478,486],[478,577]].map(([x,y]) => {
        const p = new DOMPoint(x,y).matrixTransform(m); return { x: p.x, y: p.y };
      });
    });
    // A tap and a cancelled gesture cannot complete the incense or connect to the next stroke.
    await page.mouse.move(corners[0].x, corners[0].y); await page.mouse.down();
    await surface.dispatchEvent("pointercancel", { pointerId: 1, bubbles: true }); await page.mouse.up();
    await expect(surface).toHaveAttribute("aria-disabled", "false");
    await page.mouse.click(corners[0].x, corners[0].y);
    await expect(surface).toHaveAttribute("aria-disabled", "false");
    await page.mouse.move(corners[0].x, corners[0].y); await page.mouse.down();
    for (const p of corners.slice(1)) {
      await page.mouse.move(p.x, p.y); // Only one move per straight section, no dense path sampling.
      if (delay) await page.waitForTimeout(delay);
    }
    await page.mouse.up();
    await expect(surface).toHaveAttribute("aria-disabled", "true");
    await expect(page.locator(".quiet-smoke")).toBeVisible();
    await expect(page.getByRole("button", { name: "收好这一小时" })).toHaveCount(0);
    await page.getByRole("button", { name: "收好这一小时" }).click();
    await expect(page.locator(".rejoining")).toBeVisible();
  });
}

test("FINAL 鱼灯取消操作保留材料且松手不误点亮", async ({ page }) => {
  await to(page, 4);
  const paper = page.getByTestId("paper");
  const b = (await paper.boundingBox())!;
  await page.mouse.move(b.x + b.width/2, b.y + b.height/2); await page.mouse.down();
  await paper.dispatchEvent("pointercancel", { pointerId: 1, bubbles: true }); await page.mouse.up();
  await expect(paper).toBeVisible();
  await expect(page.getByTestId("paint")).toHaveCount(0);
  await drag(page, '[data-testid="paper"]', '[data-testid="lantern-target"]');
  const paint = page.getByTestId("paint"), p = (await paint.boundingBox())!;
  await page.mouse.move(p.x+40,p.y+p.height/2); await page.mouse.down();
  await page.mouse.move(p.x+80,p.y+p.height/2); await page.mouse.up();
  await expect(page.locator("#fish-paint path")).toHaveCount(1);
  expect(await page.locator("#fish-paint path").getAttribute("d")).toContain(" L");
  await expect(paint).toBeVisible();
  await page.mouse.move(p.x+40,p.y+p.height/2); await page.mouse.down();
  await page.mouse.move(p.x+p.width-30,p.y+p.height/2); await page.mouse.up();
  const light = page.getByRole("button", { name: "长按600毫秒点亮鱼灯" });
  await light.click(); await page.waitForTimeout(800);
  await expect(light).toBeVisible();
  const l = (await light.boundingBox())!;
  await page.mouse.move(l.x+l.width/2,l.y+l.height/2); await page.mouse.down();
  await light.dispatchEvent("pointercancel", { pointerId: 1, bubbles: true }); await page.mouse.up();
  await page.waitForTimeout(800); await expect(light).toBeVisible();
});

// Chromium exposes real touch input through CDP; WebKit retains its native tap and pointer checks.
test("FINAL 实际触控拖纸、添色、取消长按与点亮", async ({ page, browserName }) => {
  await to(page, 4);
  if (browserName === "webkit") {
    await completeCore(page, 4);
    await page.getByRole("button", { name: "同一时间，看看妈妈这一刻" }).tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    return;
  }
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  const input = await page.context().newCDPSession(page);
  async function touch(type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel", x = 0, y = 0) {
    await input.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" || type === "touchCancel" ? [] : [{ x, y, radiusX: 6, radiusY: 6, id: 1 }] });
  }
  const paper = (await page.getByTestId("paper").boundingBox())!, target = (await page.getByTestId("lantern-target").boundingBox())!;
  await touch("touchStart", paper.x+paper.width/2,paper.y+paper.height/2);
  await touch("touchMove", target.x+target.width/2,target.y+target.height/2); await touch("touchEnd");
  const p = (await page.getByTestId("paint").boundingBox())!;
  await touch("touchStart",p.x+30,p.y+p.height/2);
  await touch("touchMove",p.x+p.width-30,p.y+p.height/2); await touch("touchEnd");
  const light = page.getByRole("button", { name: "长按600毫秒点亮鱼灯" }), l = (await light.boundingBox())!;
  await touch("touchStart",l.x+l.width/2,l.y+l.height/2); await touch("touchCancel");
  await page.waitForTimeout(750); await expect(light).toBeVisible();
  await touch("touchStart",l.x+l.width/2,l.y+l.height/2); await page.waitForTimeout(700); await touch("touchEnd");
  await expect(page.locator(".scene-departure")).toBeVisible();
  await page.getByRole("button",{name:"同一时间，看看妈妈这一刻"}).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".mother-leave").tap(); await expect(page.locator(".continue, .scene-departure")).toBeVisible();
  expect(errors).toEqual([]); await input.detach();
});
