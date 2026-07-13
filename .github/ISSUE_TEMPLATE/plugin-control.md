---
name: 注册、更新或删除插件
about: 通过 Markdown 控制块管理插件注册
title: "[插件注册] "
labels: PluginControl
assignees: delta-comic-bot
---

第一次使用请先阅读[插件 Issue 控制使用指南](https://github.com/delta-comic/awesome-plugins/blob/main/docs/plugin-issue-control-guide.md)。指南包含完整示例、权限说明和常见问题。

请只修改下方控制块中冒号右边的内容，并保留 `plugin-control` 标记和代码围栏。

- 注册或更新使用 `action: upsert`，`download` 支持 `gh:owner/repo` 或 HTTPS URL。
- 删除使用 `action: remove`，并删掉 `download` 和 `authors` 两项。
- 提交人会自动加入作者；更新或删除只能由登记作者、经 GitHub 验证的仓库维护者或注册表维护者执行。
- 如果机器人报告错误，请编辑本 Issue 的正文；评论中的命令不会被执行。

<!-- plugin-control -->
```yaml
# upsert 表示注册或更新；删除时改为 remove
action: upsert
# 替换为插件在市场中的唯一名称
id: replace-with-plugin-id
# GitHub 仓库写成 gh:所有者/仓库名
download: gh:owner/repository
# 如需登记其他作者，请删除下面两行开头的 #
# authors:
#   - another-github-login
```
