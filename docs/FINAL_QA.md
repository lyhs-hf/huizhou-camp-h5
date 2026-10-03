# Production v1.0.0 · FINAL QA

- 最终生产 Commit：待正式发布后补记；实现候选 `32a162f200aea3003a9f181f7a68ba88146bf9e2` 已推送 main，历史标签不改动。
- CI：[运行 37087882176](https://github.com/lyhs-hf/huizhou-camp-h5/actions/runs/37087882176) 尚未通过。已观察到旧 `.quiet-smoke` 单元素断言因新双路径轻烟触发 strict-mode 失败；改为检查两条路径分别可见，Chromium / WebKit 375 慢速与 390 快速稀疏触点专项 4/4 PASS（2.5 分钟）。产品构建未改；最终全量回归与部署仍待完成。未创建 `v1.0.0`。
- 本地：TypeScript / Lint / Unit 5/5 / Pages base Build / diff check PASS。相关描金、局部添色、主动札记、穿云、音频、触控、PNG、演示留资专项通过。
- 浏览器：Chromium 实际 390×844 原生指针完整路线、篆香、PNG 1050×2277 与演示留资 PASS；WebKit 390×844 完整 Pointer 路线和四段音频专项 PASS。鱼灯点亮因浏览器工具无长按接口使用一次公开键盘入口，600ms 真实长按由触控专项验证；没有改 State / 跳 Phase。
- Viewport：375×812 / 390×844 / 430×932 全幕无横向溢出 PASS；390×844 reduced-motion 全路线 PASS。430 初次运行受并行测试输出目录冲突影响，独立目录重跑 PASS。
- BGM：四段 53.333 秒原声采样原创编排；实测 -19.43～-19.58 LUFS，最大 true peak -1.40 dBTP。用户试听确认“可以，按这套配乐完成发布”；没有将工具无法听音写成人工听感通过。
- Production URL：https://lyhs-hf.github.io/huizhou-camp-h5/
- Public QA：待 Pages 更新后实际公开地址完整手势复验。
- 外部业务事项：真实营期及业务资料、正式 CRM 接口、微信真机环境、正式品牌资产授权。留资演示不保存手机号、不发送 CRM。
