# 一卷冬日行旅

《新东方文旅｜徽州过大年·黄山冬雪亲子六日营》本地 H5 成品。Vite、React、TypeScript，11 幕，四个 Pointer 互动，黄山六层视差，亲子分屏，三种个性化 PNG 行旅卷与演示资料表单。

## 启动

需要 Node.js 20.19+ 或 22.12+。

```sh
npm ci
npm run dev -- --port 5173
```

访问 http://localhost:5173 。

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium webkit
npm run playwright
```

`npm run build` 生成 `dist/`。可部署到支持静态文件的站点根路径。嵌套路径部署由 Vite base 与统一资源函数处理。`npm run preview` 可预览生产构建。

## 维护位置

- `src/content/`：六日路线、期待选择、知识内容、个性化结果与核心文案。
- `src/interactions/`：覆纸、添色与长按；徽墨 SVG 描金；木槌与点朱；调焦与观察记录。
- `src/app/`：内存状态、幕切换、全局与局部手势互斥。
- `src/components/`：抽屉、焦点管理、表单、互动辅助入口。
- `src/scenes/`：启程、路线、云端、亲子分屏与归卷。
- `src/services/`：留资与声音接口；`src/analytics/`：事件接口。
- `public/assets/`：30 张生成图片，均已转为本地 WebP；品牌文字与纸纹为代码/SVG。
- `reference/route/`：用户提供的参考截图，未作为页面截图堆叠。
- `docs/FINAL_QA.md`：当前候选版本的实际验收结果与待验证项目。
- `docs/VERSION_HISTORY.md`：Git 版本与核心变更。
- `docs/INTEGRATION.md`：真实留资、埋点和音频接入位置。
- `docs/qa/`：各幕初始与完成状态、路线、价值、行旅卷和留资截图。

项目没有真实后端、真实联系人提交、CRM、客服、稀缺营位或持久化联系人。Demo 仅在本次页面内验证流程；关闭抽屉或刷新会释放字段。页面也明确说明生成画面为行旅意境，而非真实团期照片。

图片生成提示词记录在 `docs/IMAGE_PROMPTS.json`。`docs/ASSET_SIZES.json` 记录压缩资源；`docs/asset-sources.local.json` 为本机原始生成素材路径，重新压缩时可用 `node scripts/prepare-assets.mjs 自己的素材清单.json`。运行与构建无需原始 PNG。

## Deployment

发布仓库为 [lyhs-hf/huizhou-camp-h5](https://github.com/lyhs-hf/huizhou-camp-h5)。Production Candidate 使用相对资源路径；`npm run build` 后运行 `PLAYWRIGHT_PREVIEW=1 npm run playwright`，可对生产预览执行双浏览器回归。该仓库子目录可通过 `VITE_BASE_PATH=/huizhou-camp-h5/ npm run build` 指定，并以 `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173/huizhou-camp-h5/` 测试；测试会让预览服务使用同一个目录。仓库 Pages 的 Source 选 GitHub Actions；推送 main 后，工作流执行安装、类型检查、Lint、单元测试、构建，再对实际 dist 的 Pages 子目录运行 Chromium/WebKit 回归，通过后发布。流程依据 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。首次发布须由仓库管理员开启 Pages；部署结果及实际浏览链接见仓库 Actions。
