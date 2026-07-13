---
name: 注册、更新或删除插件
about: 通过 Markdown 控制块管理插件注册
title: "[插件注册] "
labels: PluginControl
assignees: delta-comic-bot
---

请只修改下方 YAML 中的值，并保留 `plugin-control` 标记和代码围栏。

- 注册或更新使用 `action: upsert`，`download` 支持 `gh:owner/repo` 或 HTTPS URL。
- 删除使用 `action: remove`，并删掉 `download` 和 `authors` 两项。
- 提交人会自动加入作者；更新或删除只能由登记作者、经 GitHub 验证的仓库维护者或注册表维护者执行。

<!-- plugin-control -->
```yaml
action: upsert
id: replace-with-plugin-id
download: gh:owner/repository
# authors:
#   - another-github-login
```
