import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const origin = process.env.QA_URL ?? "http://localhost:5173";
await fs.mkdir("docs/qa", { recursive: true });
const browser = await chromium.launch();
const reports = [];
for (const [width, height] of [
  [320, 568],
  [375, 812],
  [390, 844],
  [430, 932],
]) {
  if (process.env.QA_WIDTH && String(width) !== process.env.QA_WIDTH) continue;
  const page = await browser.newPage({
    viewport: { width, height },
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin);
  await page.locator('main[data-scene="1"]').waitFor();
  for (let s = 1; s <= 10; s++) {
    await page.waitForTimeout(680);
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((i) => i.decode().catch(() => {})),
      ),
    );
    await page.screenshot({
      path: `docs/qa/${width}-scene-${String(s).padStart(2, "0")}.png`,
    });
    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => !i.naturalWidth)
        .map((i) => i.src),
    );
    if (broken.length) errors.push(...broken.map((x) => "Broken image: " + x));
    if (s === 2)
      await page.getByRole("button", { name: /亲手做过的中国文化/ }).click();
    if (s === 4)
      for (const name of ["轻点，覆上灯纸", "轻点，添上颜色", "轻点，点亮鱼灯"])
        await page.getByRole("button", { name }).click();
    if (s === 5) await page.getByRole("button", { name: "辅助描金" }).click();
    if (s === 6) {
      await page.getByRole("button", { name: "轻点，敲开年礼" }).click();
      await page.getByRole("button", { name: "点一点朱红" }).click();
      await page.getByText("年岁印", { exact: true }).waitFor();
    }
    if (s === 7) {
      await page.getByRole("button", { name: "辅助调焦" }).click();
      await page.getByRole("button", { name: "轻点，记下发现" }).click();
    }
    if (s >= 4 && s <= 7) {
      await page.waitForTimeout(700);
      await page.screenshot({
        path: `docs/qa/${width}-scene-${s}-complete.png`,
      });
    }
    if (s === 8) {
      await page.getByRole("button", { name: "向上轻推，慢慢入云" }).click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `docs/qa/${width}-scene-8-clouds.png` });
    }
    if (s < 10) await page.locator(".continue").click();
  }
  for (const [name, selector] of [
    ["route", ".full-route"],
    ["values", ".value-section"],
    ["result", ".result-card"],
    ["cta", ".closing-cta"],
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `docs/qa/${width}-${name}.png` });
  }
  await page.getByRole("button", { name: "保存我的冬日行旅卷" }).click();
  await page.getByTestId("saved-image").waitFor();
  const png = await page
    .getByTestId("saved-image")
    .evaluate((i) => ({ width: i.naturalWidth, height: i.naturalHeight }));
  await page.getByRole("button", { name: "获取完整营期资料" }).click();
  await page.waitForTimeout(650);
  await page.screenshot({ path: `docs/qa/${width}-lead.png` });
  reports.push({ viewport: { width, height }, errors, png });
  await page.close();
}
await browser.close();
if(process.env.QA_WIDTH){const prior=JSON.parse(await fs.readFile("docs/qa/inspection.json","utf8"));for(const item of prior)if(!reports.some(x=>x.viewport.width===item.viewport.width))reports.push(item);reports.sort((a,b)=>a.viewport.width-b.viewport.width);}
await fs.writeFile("docs/qa/inspection.json", JSON.stringify(reports, null, 2));
console.log(reports);
if (reports.some((x) => x.errors.length)) process.exitCode = 1;
