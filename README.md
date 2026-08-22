<!--lint disable awesome-heading awesome-toc awesome-github double-link -->

<div align="center">
<h1>Awesome Plugin</h1>
<h3>社区的Delta Comic插件集散地。</h3>

<img alt="logo" src="./icon.png" width="120" height="120" />

</div>

## 如何添加你的插件

- 第一次使用请阅读[插件 Issue 控制使用指南](./docs/plugin-issue-control-guide.md)，无需编程基础。
- 使用[插件控制 Issue 模板](https://github.com/delta-comic/awesome-plugins/issues/new/choose)，在控制块中注册、更新或删除插件。
- 机器人会验证提交者权限；登记作者、目标 GitHub 仓库维护者或本注册表维护者才可修改已有记录。

## 市场索引

- 分页入口：[registry/index.json](./registry/index.json)
- 数据结构：[schemas](./schemas)
- Delta Comic AI 对接提示词：[docs/delta-comic-integration-prompt.md](./docs/delta-comic-integration-prompt.md)

<!-- Generated plugin catalog: do not edit below -->

### delta-comic-plugin-layout

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-plugin-layout&user&theme=transparent)](https://github.com/delta-comic/delta-comic-plugin-layout)

**下载:**

```sh
ap:layout
```

<details>
<summary>Readme</summary>

# Delta Comic 基础布局插件

[![GitHub](https://img.shields.io/github/license/delta-comic/delta-comic-plugin-layout)](https://github.com/delta-comic/delta-comic-plugin-layout/blob/main/LICENSE)

这是 [Delta Comic](https://github.com/delta-comic/delta-comic) 的官方基础布局插件，提供：

- 内容详情、作者订阅、标签、推荐与评论布局；
- 图片阅读器（翻页、双页、连续阅读）和 Artplayer 视频播放器；
- 收藏、点赞、分享、举报与插件配置入口；
- 可由其他插件扩展的 `DcEnvironment` 插槽。

当前代码面向 Delta Comic `>=3.0.0-next.15 <4.0.0` 与插件 API v1。每次 GitHub Release 同时发布同版本的 GitHub Package，用户也可以从 Release 下载 `plugin.zip` 并通过 Delta Comic 安装；`manifest.json` 同时作为可独立读取的发布元数据提供。

视频播放器支持 MP4/WebM 等浏览器原生格式及 HLS 线路，提供字幕、倍速、画中画、AirPlay、锁屏和全屏等常用控制。移动端可长按临时切换到 3 倍速，双击播放或暂停。其他内容插件仍通过 `ContentVideoPage.fetchVideo()` 返回 `{ sources, textTrack? }` 配置，其中 `sources` 为线路数组，`textTrack` 可附加 VTT、SRT 或 ASS 字幕。

## 开发

项目使用 Vite+ 和 pnpm workspace：

```sh
vp install
vp run dev
```

提交前运行完整门禁：

```sh
vp check
vp run typecheck
vp test run --coverage
vp run build
vp run artifacts
```

构建产物位于 `packages/app/dist/`。`vp run artifacts` 会验证外置 manifest、压缩包内 manifest 与实际入口文件完全一致。

发布分支和产物规则见 [发布流程](docs/release-workflow.md)。其他插件希望复用布局、阅读器或组件时，见 [布局插件接入指南](docs/plugin-integration.md)。

</details>

### jmcomic-sdk

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=jmcomic-sdk&user&theme=transparent)](https://github.com/delta-comic/jmcomic-sdk)

**下载:**

```sh
ap:jmcomic
```

<details>
<summary>Readme</summary>

# 禁漫天堂 · Delta Comic 插件

为 Delta Comic 提供禁漫天堂内容的插件与 TypeScript SDK。

## 功能

- 漫画：搜索、分类、章节、图片解密、推荐、收藏、评论与回复。
- 图文：搜索、安全富文本、推荐、评论与回复。
- 小说：搜索、章节正文、推荐、收藏与评论。
- 创作者画册：作者、作品详情和图片内容；服务端不支持的点赞、评论和举报不会伪造成功。
- 账户：登录、注册、令牌会话恢复、收藏同步、签到、资料编辑、徽章与称号。
- 发现：分区、排行榜、热门标签、推荐页、随机推荐、JM 编号识别和作者订阅。
- 分流：插件探测 API 分流时自动选择延迟最低的可用节点；图片 CDN 则独立探测并在加载时执行图片解密。

界面使用 Delta Comic UI、Naive UI 与 Tailwind CSS。

## 仓库结构

- `packages/app`：唯一 Delta Comic 插件入口，注册 `comic`、`blog`、`novel`、
  `book-author`、`book` 五个技术路由。
- `packages/sdk`：请求、分流、鉴权、分页、响应校验和图片解码。浏览器解码器从
  `jmcomic-sdk/browser` 导出，Node/Sharp 解码器从 `jmcomic-sdk/node` 导出。
- `script`：发布分支、semantic-release 和产物验证。

服务端没有官方 API 文档。SDK 的响应类型与解析规则来自解包。

## 开发

项目使用 Vite+、pnpm catalog、TypeScript 7 与 `vue-tsc`：

```sh
vp install --frozen-lockfile
vp fmt --check
vp lint
vp run typecheck
vp test typecheck
vp test run --coverage
vp run build
vp run artifacts
```

运行时集成测试默认请求真实服务。若初始分流发现因网络不可用而失败，测试才启动本地 MSW
回退服务。账户读取测试通过 `JMCOMIC_TEST_USERNAME` 与 `JMCOMIC_TEST_PASSWORD` 注入凭据；不要把
凭据写进仓库。测试代码不导入 Zod，公共类型使用 Vitest `.test-d.ts`、`expectTypeOf` 与
`assertType` 验证。

覆盖率门槛为 statements 80%、branches 75%、functions 80%、lines 80%。

## 安装插件

GitHub Release 固定提供两个资产：

- `manifest.json`
- `plugin.zip`

`plugin.zip` 内包含与外置文件完全一致的 manifest，以及入口 JavaScript 和 CSS。请在 Delta Comic
的插件管理界面使用对应 Release 资产安装。发布与远端产物验收详见
[发布流程](docs/release-workflow.md)。

## SDK

使用示例与公共接口见 [SDK 文档](packages/sdk/README.md)。

## 许可证

[MIT](LICENSE)

</details>

### delta-comic-plugin-cosav

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-plugin-cosav&user&theme=transparent)](https://github.com/delta-comic/delta-comic-plugin-cosav)

**下载:**

```sh
ap:cosav
```

<details>
<summary>Readme</summary>

# Delta Comic Plugin Cosav - _<span style="font-weight: lighter;font-size:16px">何以殁亡</span>_

[![GitHub](https://img.shields.io/github/license/delta-comic/delta-comic-plugin-cosav)](https://raw.githubusercontent.com/delta-comic/delta-comic-plugin-cosav/main/LICENSE)
![Download](https://img.shields.io/github/downloads/delta-comic/delta-comic-plugin-cosav/total)

- [delta-comic](https://github.com/delta-comic/delta-comic)的插件

## 功能

- 提供有关 _Cosav **/** cos天堂_ 的相关功能

## 如何使用

- 将release的latest的js源码链接填入"添加插件"的地址栏

## 想要编写插件?

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-core&user&theme=transparent)](https://github.com/delta-comic/delta-comic-core)
 该包可为你提供许多基本的数据结构, 与便捷的`definePlugin`

## 源项目

### Delta Comic

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/delta-comic-plugin-cosav&type=Date)](https://www.star-history.com/#delta-comic/delta-comic-plugin-cosav&Date)

</details>

### delta-comic-plugin-bika

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic-plugin-bika&user&theme=transparent)](https://github.com/delta-comic/delta-comic-plugin-bika)

**下载:**

```sh
ap:bika
```

<details>
<summary>Readme</summary>

# Delta Comic Plugin Bika - _<span style="font-weight: lighter;font-size:16px">何以忘却</span>_

[![GitHub](https://img.shields.io/github/license/delta-comic/delta-comic-plugin-bika)](https://raw.githubusercontent.com/delta-comic/delta-comic-plugin-bika/main/LICENSE)
![Donwload](https://img.shields.io/github/downloads/delta-comic/delta-comic-plugin-bika/total)

- [delta-comic](https://github.com/delta-comic/delta-comic)的插件

## 功能

- 提供有关 _Pica Acg **/** Bika **/** 哔卡漫画_ 的相关功能

## 如何使用

- 将release的latest的js源码链接填入"添加插件"的地址栏

## 想要编写插件?

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=wenxig&repo=delta-comic-core&user&theme=transparent)](https://github.com/delta-comic/delta-comic-core)
 该包可为你提供许多基本的数据结构, 与便捷的`definePlugin`

## 源项目

### Delta Comic

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/delta-comic-plugin-bika&type=Date)](https://www.star-history.com/#delta-comic/delta-comic-plugin-bika&Date)

</details>
