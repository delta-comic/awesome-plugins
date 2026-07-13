# Delta Comic 插件市场索引对接提示词

将下面整段提示词交给 Delta Comic 项目的 AI，并让它在目标仓库中直接完成实现和测试。

```text
你正在 delta-comic/delta-comic 项目中工作。请先阅读该项目的本地规范和现有插件安装、市场、网络请求、缓存与类型定义代码，再把插件市场数据源迁移到 awesome-plugins v1 分页索引。不要只给方案，请完成代码、测试和必要文档。

数据根地址：
https://raw.githubusercontent.com/delta-comic/awesome-plugins/main/

入口：
1. GET registry/index.json
2. 校验 schemaVersion === 1。
3. 按 index.pages[].path 请求分页文件；路径相对于数据根地址，不是相对于 index.json。
4. 分页文件的结构由 schemas/registry-page.schema.json 描述，单项结构由 schemas/plugin-listing.schema.json 描述。

必须遵守的数据语义：
- index 包含 pageSize、totalItems、totalPages 和 pages；空市场允许 totalPages 为 0、pages 为空。
- 分页文件包含 pagination 和 items。使用 pagination.previous/next 做增量翻页；它们同样相对于数据根地址。
- 每个插件的 id 是 ap:<id> 安装标识。authors 是 GitHub 登录名数组。
- download 是判别联合：
  - { type: "github", repository: "owner/repo" }
  - { type: "url", url: "https://..." }
- repository、release 都是可选字段，不得因为插件没有 GitHub 元数据或没有正式发行版而丢弃该插件。
- release 只表示 GitHub 最新正式发行版，不包含 draft 或 prerelease。
- release.manifestUrl 存在时，它直接指向最新正式发行版的 manifest.json。不得将 ZIP 或其他压缩包链接当作 manifestUrl。
- 不支持的 schemaVersion 应显示可恢复错误，不得静默按旧结构解析。

实现要求：
- 复用目标项目现有 HTTP、状态管理、持久化和类型检测方案；不要引入平行架构。
- 为 index、page、plugin、download、repository、release 建立严格类型。网络边界必须运行时校验，不能只用 TypeScript 类型断言。
- 市场列表按页加载，支持加载态、空态、重试、到达末页和刷新。不要一次预取所有页。
- 缓存最近一次成功的 index 和已读取页面；网络失败时可展示带“数据可能过期”状态的缓存结果。
- 安装流程从新的 download 判别联合适配到项目现有安装器；不要在 UI 层重新解析 gh: 字符串。
- 保留对当前用户收藏、已安装版本或更新检查逻辑的兼容，按 id 合并本地状态与市场项。
- release.manifestUrl 可用于更新检查，但缺失时必须回退到已有安装/下载逻辑。
- 添加覆盖正常分页、空索引、未知 schemaVersion、无 release、无 manifestUrl、直接 manifest 链接和网络失败缓存回退的测试。
- 删除已经不再使用的旧索引适配代码，但不要改动无关模块。

验收时请运行目标项目规定的格式化、lint、类型检查和测试命令，并总结改动文件、兼容策略和测试结果。
```
