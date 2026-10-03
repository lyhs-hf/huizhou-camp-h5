# Production v1.0.0 · FINAL QA

- 最终生产 Commit：`90dc3c6be34cb5ea4ae6913bb554e67d9c8ecdbb`；annotated Tag：[v1.0.0](https://github.com/lyhs-hf/huizhou-camp-h5/tree/v1.0.0) 已公开，正确指向该提交。历史标签保持原位；此后的补记提交只更新验收文档。
- CI / Pages：[运行 37092566754](https://github.com/lyhs-hf/huizhou-camp-h5/actions/runs/37092566754) SUCCESS。TypeScript / Lint / Unit 5/5 / Pages base Build PASS；Chromium + WebKit 全量 116/116 PASS（43.3 分钟），部署成功。前轮轻烟断言与触控收笔阻断均修复后重新通过，没有忽略失败发布。
- 本地：相关笔迹、主动札记、穿云、音频、触控取消与有效抬手、PNG、演示留资专项及 diff check PASS。
- 浏览器 / Viewport：Chromium / WebKit PASS；375×812 / 390×844 / 430×932 全幕文字边界与无横向溢出 PASS，reduced-motion 可完成。公开 HTTPS 375/430 布局及触控专项 6/6 PASS（3.0 分钟）。
- Public QA：正式地址 390×844 原生指针从启程至 Closing 完整走查 PASS。鱼灯局部添色；描金初始 `[0,0,0]`、两笔局部 `[115,0,0]`，收笔不补金；四站价值显现；年礼 / 红纸 / 天井 / 年宴连续；猴子看过三个细节并额外停留 20 秒仍无自动札记，主动记下；一次穿云、谷间云实际位移；妈妈 Divider 50→62、三枚 SVG 箭头、篆香 / 轻烟 / 合流；PNG 1050×2277；留资明确未保存、未发送。控制台 error / warn 为零。浏览器工具无长按接口，原生走查仅点亮使用一次公开键盘入口；真实 600ms 长按由公开触控专项验证。未改 State / 跳 Phase。
- BGM：四段 53.333 秒原声采样原创编排；实测 -19.43～-19.58 LUFS，最大 true peak -1.40 dBTP。用户试听确认“可以，按这套配乐完成发布”；公开 A/B/C/D 状态跟随场景、实际播放，音频文件与本地一致。工具无法听音，听感通过依据用户确认。
- Production URL：https://lyhs-hf.github.io/huizhou-camp-h5/ 。54 个发布文件均可加载且 SHA-256 与本地一致；首轮四个音频请求网络失败，重试全部通过，无 404 / 文件差异。完整验收与标签发布后，收尾重载出现 ERR_CONNECTION_CLOSED / ECONNRESET，当前连接无法确认随后即时可达性；这次网络复查未记作 PASS。
- 外部业务事项：真实营期及业务资料、正式 CRM 接口、微信真机环境、正式品牌资产授权。留资演示不保存手机号、不发送 CRM。
