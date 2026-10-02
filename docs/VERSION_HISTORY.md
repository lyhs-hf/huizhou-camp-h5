# 版本记录

| 版本 | 日期 | 核心改动 | Commit Hash |
|---|---|---|---|
| V2.0_IMMERSION_REBUILD | 2026-10-01 | 冻结 V2 沉浸式重建基线；Tag：v2-baseline | de7c7bd028cc23a8fb2fc87fa5bc3bc1ac7bf280 |
| FINAL · 体验实现 | 2026-10-01 | 精修四站手作、两个妈妈时刻、黄山与 Closing；新增 6 张素材；修复键盘与资源路径。 | 40db68476bb1eb60c273d0a17fd2a1ca3117d2aa |
| FINAL · 生产验收配置 | 2026-10-01 | Pages CI 改为对实际 dist 及 Pages 子目录运行双浏览器回归。 | 383bc8891284bc40c5b944a90c097203d7d91c03 |
| FINAL_1.0_PRODUCTION | 2026-10-01 | Production Candidate；解决 24 项体验 / 部署问题，校准长流程测试时限；五角色与三个目标手机尺寸走查、84 项双浏览器生产回归及 6 项 Pages 子目录检查通过；独立 Preview 与 Pages 配置就绪。发布 Tag：final-1.0；此列记录经验证的实现提交，发布提交仅更新两份验收文档。 | 833ed1d06e4b6f71ca53e0294f4356025a39ad6c |
| FINAL 1.0 · 徽墨修复 | 2026-10-01 | 修复真实普通拖动无法完成描金：按划过的笔迹判定覆盖，支持抬手续画；三尺寸稀疏拖动、偏离路径、原指针与键盘双浏览器专项 10 / 10 通过，内置浏览器真实拖动复核；保持 final-1.0 原标签。 | 1725223a86b8d2266df90113bddd875481bfb337 |
| FINAL · 公开发布 | 2026-10-01 | 保留原仓库历史并发布到公开 GitHub Pages；实际仓库子目录专项 6 / 6、GitHub Runner 全量生产回归 90 / 90、部署后公开 HTTPS 首页与 PNG 导出专项 4 / 4 通过。[公开 H5](https://lyhs-hf.github.io/huizhou-camp-h5/)；[发布工作流](https://github.com/lyhs-hf/huizhou-camp-h5/actions/runs/36855894610)。 | 8dd52c07e60c651d996834f31dea98a28d194036 |
| FINAL_2.0_INTERACTION_DRIVEN | 2026-10-02 | 四站情境理由；SVG 纸面添色、茶筅 / 茶面、香迹 / 轻烟与环境光；年礼空间连续推进；具体观察记录；妈妈无任务看山；黄山完整抵达。三尺寸生产指针走查、CI 双引擎 110 / 110、公开 HTTPS 专项 12 / 12 与完整实际指针流程通过；37 个线上文件与本地构建一致。Tag：final-2.0，保留原标签。[发布工作流](https://github.com/lyhs-hf/huizhou-camp-h5/actions/runs/36904543119)。 | adaea166657059610093124b8372aabe8d3fc485 |
| EXPERIENCE_DIRECTORS_CUT | 2026-10-02 | 六幕独立沉浸空间；替换短尾猴旧坐标 / slider / 定时问答及黄山 height / slider；墨面留金、年礼打开老宅、妈妈感官时光与材质转场；新增 5 张 WebP。三尺寸实际生产走查、CI 双引擎 110/110、公开 HTTPS 24/24 与完整实际指针流程通过；42 个线上文件与本地构建一致。[发布工作流](https://github.com/lyhs-hf/huizhou-camp-h5/actions/runs/36975457059)，Tag：[final-3.0](https://github.com/lyhs-hf/huizhou-camp-h5/tree/final-3.0)；保留 final-2.0。 | a8cc5aca22cb2735baadcb5987cfe95ed82790a8 |

| FINAL 3.0 · SVG 连续体验与声音 | 2026-10-02 | 修复描金隐藏顺序与长按选字；原创循环配乐；SVG 覆纸 / 添色 / 米团形变 / 脱模 / 朱红 / 门框及全局材质转场；茶面修正、群峰轻雾；新增 2 张 WebP。生产专项 24/24、20/20，最后门框改动回归 16/16；三尺寸实际走查与双浏览器文字边界检查通过。公开发布结果见 FINAL_QA 补记；保留原标签。 | 8fa68bcbff7debfa85e51f4997c8583468ff1171（配乐与描金：a5ba8d8） |

| FINAL 3.0 · 材质与真实门洞连续转场 | 2026-10-03 | 同桌年礼 / 红纸 / 真实门洞推进，修复反向揭幕；目标空间实际材质与柔边 SVG 衔接，撤掉硬边擦屏。冻结生产构建双浏览器 34/34、三尺寸文字边缘 / reduced-motion、390 实际全流程及 PNG / 配乐 / 演示留资通过；公开验收待补记。原 final-3.0 标签保留。 | 8f10bc4ab66013811e6f8c2f34a8519e1ee06d8f |
