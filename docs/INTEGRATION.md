# 接入说明

## 留资

`src/services/lead.ts` 导出 `setLeadAdapter` 与 `submitLead`，接收 `LeadPayload` 和 AbortSignal。默认 adapter 只延迟返回成功，不调用网络，不打印字段，不写入存储。手机、年龄、称呼只存在于抽屉局部内存。

正式接入时在入口安装真实 adapter，将 payload POST 到已确认的服务端，支持 signal 与明确的失败返回。服务器负责校验、限流、隐私保护和 CRM 写入。前端禁止将联系方式发给 Analytics，禁止以 localStorage/sessionStorage 保存联系人。成功后清空手机与称呼；关闭提交中的抽屉会中止请求。

同时修改 LeadSheet 中的演示成功说明、演示隐私说明和 `lead_submit_success` 的 `demo` 字段，替换为真实业务与隐私规则。没有真实接入前，应保留当前演示提示。

## 埋点

`src/analytics/index.ts` 的 `setAnalyticsAdapter` 接入已批准的分析服务。目前只 `console.debug`，仅传递期待类型与互动状态，不含 phone/name/WeChat。

已调用事件：h5_open、journey_start、expectation_select、fish_lantern_start/complete、ink_start/complete、new_year_start/complete、macaque_start/complete、mountain_enter、parent_child_slider、route_overview_view、result_generated、result_save、lead_cta_click、lead_submit_attempt/success/error。

互动开始事件在当前尝试首次动作时记录。重试是一轮新尝试；印记状态用集合去重。返回幕会恢复已完成状态。刷新从序幕开始，不恢复联系方式。

## 音频

`src/services/sound.ts` 提供启停与静默失败逻辑。默认关闭，没有自动播放，没有外部音频文件。本次没有可验证质量与授权的音频，因此采用规格允许的全程安静版本。

正式加入声音时使用 `public/assets/sound/` 本地文件，先由明确用户手势启用，再连接状态与 SoundManager。场景切换调用 stop，并保留全局关闭入口。录音版权与内容需要业务方确认。

## 图片与品牌

23 张图片全部由 ImageGen 生成。透明手作和山景层保留 alpha；压缩尺寸可见 ASSET_SIZES.json。PNG 导出等待本地图像 decode，3 倍像素倍率，不依赖 CDN 字体。二维码、真实微信分享 SDK、官方 logo、正式中文品牌字体都没有被伪造。

目前品牌采用文字排版。正式发布前确认官方标志、字体授权、路线安排、价格与营期、生成图片的对外展示方式，并在实际 iOS/Android 微信环境验证触控、键盘顶起与长按保存。
