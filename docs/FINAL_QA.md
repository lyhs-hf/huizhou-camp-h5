# FINAL 1.0

状态：待最终验收。以下体验 PASS 指内置浏览器人工走查，不代表 Chromium / WebKit 自动化全部通过。日期：2026-10-01；体验代码：40db684；生产回归配置：383bc88。

## Build

PASS — Production Build；相对路径和 `/pages-preview/` 子目录构建均在内置浏览器完成全流程、图片加载、PNG 导出及 Demo 留资验证，无错误日志。

ISSUE — 独立 `npm run preview` 启动被当前执行环境拒绝（`listen EPERM 127.0.0.1:4173`），尚未完成独立 Preview 验收。

## Tests

PASS — typecheck、lint、unit（1 项测试 / 4 条校验断言）、git diff --check。

PASS — Pages 工作流 YAML 解析；回归改为运行实际 dist 的 Production Preview，并保留 Pages 子目录。生产预览配置下仍收集到全部 84 项测试。

ISSUE — Playwright 已收集 84 项（42 场景 × Chromium / WebKit）；Chromium 启动报 MachPort 权限拒绝，WebKit 在进入页面前退出。完整自动化回归、reduced-motion 和 Safari 验收仍待可运行浏览器的环境，不能计为通过。V2 的历史测试结果不代替 FINAL 回归。

## Browsers

- Chromium：PASS — 内置浏览器人工走查；ISSUE — Playwright 进程无法启动。
- WebKit：ISSUE — 浏览器进程退出，FINAL 尚未验证。

## Viewports

- 375×812：PASS — 孩子角色全流程、PNG、Demo。
- 390×844：PASS — 妈妈、UI / 交互、增长角色全流程；键盘及真实拖动专项检查。
- 430×932：PASS — 品牌角色全流程、PNG、Demo。

三个尺寸未见横向溢出；三种个性化结果 PNG 均成功导出；Demo 使用虚构测试号码，重新打开表单为空。当前 Lead 不持久化或发送联系人，Analytics 不接收联系人字段。

## Experience

按独立问题口径处理 23 项（22 项体验、1 项部署验收）；下列体验 PASS 已做页面视觉或操作复核：

| 体验 | 结果与已解决问题 |
|---|---|
| Fish Lantern | PASS — ① 灯骨 / 成品 / 亮灯轮廓统一；② 妈妈古戏台片刻改为用户主动离开。点灯后保留 2.2 秒停顿。 |
| Ink | PASS — ③ 替换默认焦点并补齐键盘描金；④ 墨锭居中、细金与侧光完成回报，停留 2.2 秒。 |
| New Year | PASS — ⑤ 真实米粉团；⑥ 移除矩形拖放框；⑦ 三次敲击反馈区分；⑧ 米团 / 食桃贴合木模位置；⑨ 木桌进入老宅的空间过渡。点朱、楹联、天井、年宴由用户推进。 |
| Macaque | PASS — ⑩ 自然山林搜索替换拼贴；⑪ 现场记录纸张替换表单式按钮，保留完整三秒观察与中性铅笔反馈。 |
| Mother Journey | PASS — ⑫ 三种私人时光拥有独立视觉；⑬ 点茶不再单击结束；⑭ 香篆路径贴合照片；⑮ 擦窗进度跨手势累计；⑯ 完成后取消自动退出；⑰ 合流图宽度适配；⑱ 情绪合流时隐藏 CTA。三种体验全部人工走通。 |
| Mountain | PASS — ⑲ 六层景深统一色调与遮罩，退去多重叠图；峰顶保留 1.8 秒山景停顿。 |
| Closing | PASS — ⑳ 三段价值章节与留白；㉑ PageDown 正常滚动；六日路线、三种 PNG、表单错误提示及 Demo 成功状态正常。 |
| 跨场景 | ISSUE — ㉒ 已修改闲置帮助计时：操作锁定时暂停，完成 / 留白时关闭菜单；新增持续按住 8.2 秒的回归用例，执行受浏览器启动限制，尚待验证。 |
| 部署验收 | ISSUE — ㉓ CI 原先只回归开发服务，现改为实际生产构建和 Pages 子目录；配置验证通过，完整运行仍待可启动浏览器及预览的环境。 |

## Remaining External Checks

- 当前执行环境允许浏览器测试进程及本地监听端口后，先 `npm run build`，再 `PLAYWRIGHT_PREVIEW=1 npm run playwright` 完成全部 84 项回归及独立 Production Preview；未通过前不创建最终发布 Commit / Tag。
- 官方 Logo / 品牌使用授权；正式营期、价格与合同事实确认。
- 真实 CRM、Analytics 接口及正式隐私协议。
- 微信及 iOS Safari 真机体验。
- GitHub 远端仓库与 Pages 授权：部署配置已准备，未创建仓库或发布。
