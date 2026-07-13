---
name: 注册、更新或删除插件
about: 通过 Markdown 控制块管理插件注册
title: "[插件注册] "
labels: PluginControl
assignees: delta-comic-bot
---

第一次使用请先阅读[插件 Issue 控制使用指南](https://github.com/delta-comic/awesome-plugins/blob/main/docs/plugin-issue-control-guide.md)。指南包含完整示例、权限说明和常见问题。

## 命令说明

| 命令 | 用途 | 必须填写 | 可选内容 | 注意事项 |
| --- | --- | --- | --- | --- |
| `upsert` | 注册新插件，或更新已有插件 | `action`、`id`、`download` | `authors` | 提交人会自动成为作者；更新已有插件需要相应权限 |
| `remove` | 从市场中删除插件登记 | `action`、`id` | 无 | 必须删除 `download` 和 `authors`；不会删除 GitHub 仓库或用户已安装的插件 |

## 代码块参考

下面的代码块仅供参考。机器人只会读取页面底部“请在这里填写”中的控制块。

### 注册或更新插件

```yaml
action: upsert
id: my-plugin
download: gh:owner/repository
```

### 注册或更新插件，并登记其他作者

```yaml
action: upsert
id: my-plugin
download: gh:owner/repository
authors:
  - another-github-login
  - one-more-github-login
```

### 删除插件登记

```yaml
action: remove
id: my-plugin
```

## 请在这里填写

请根据上方参考修改下面的控制块，并保留 `plugin-control` 标记和开头、结尾的三连反引号。如果机器人报告错误，请编辑本 Issue 的正文；评论中的命令不会被执行。

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
