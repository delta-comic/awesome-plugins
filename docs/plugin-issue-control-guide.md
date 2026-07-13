# 插件 Issue 控制使用指南

这份指南用于帮助你在 Awesome Plugin 市场中注册、更新或删除插件。你不需要会编程，只需要会编辑文字并拥有 GitHub 账号。

## 它能做什么

插件控制 Issue 支持两个命令：

| 命令 | 用途 | 什么时候使用 |
| --- | --- | --- |
| `upsert` | 注册或更新插件 | 第一次把插件加入市场，或修改已有插件的信息 |
| `remove` | 删除插件登记 | 不再希望插件出现在市场中 |

`upsert` 是“新增或更新”的合称。机器人会根据 `id` 判断插件是否已经存在：不存在就注册，已存在就更新。

## 第一次使用

1. 打开[插件控制 Issue 模板](https://github.com/delta-comic/awesome-plugins/issues/new/choose)。
2. 选择“注册、更新或删除插件”。
3. 根据你要做的事情，按照下文修改控制块。
4. 不要删除 `plugin-control` 标记，也不要删除控制块开头和结尾的三连反引号。
5. 点击页面底部的“Submit new issue”提交。
6. 等待机器人回复。机器人通常会在几秒到几分钟内处理。

如果机器人报告错误，请编辑原 Issue 的正文后重新提交修改。不要只在评论区补充内容，因为机器人读取的是 Issue 正文。

## 看懂控制块

新 Issue 中会有类似下面的内容：

```yaml
action: upsert
id: replace-with-plugin-id
download: gh:owner/repository
# authors:
#   - another-github-login
```

每一行都由“名称、英文冒号、内容”组成。例如：

```yaml
id: my-plugin
```

表示插件 ID 是 `my-plugin`。编辑时只需修改冒号右边的内容。

以 `#` 开头的行是说明或暂未启用的选项，机器人会忽略这些行。需要启用 `authors` 时，请删除它前面的 `#`。

## `upsert`：注册或更新插件

### 用途

- 把新插件加入市场。
- 修改已有插件的下载位置。
- 修改已有插件的作者列表。

### 注册 GitHub 插件

假设插件地址是：

```text
https://github.com/octocat/my-comic-plugin
```

仓库所有者是 `octocat`，仓库名称是 `my-comic-plugin`。控制块应该写成：

```yaml
action: upsert
id: my-comic-plugin
download: gh:octocat/my-comic-plugin
```

提交人会自动成为登记作者，不需要再填写 `authors`。

### 注册普通下载地址

如果插件不是托管在 GitHub，也可以使用以 `http://` 或 `https://` 开头的完整地址：

```yaml
action: upsert
id: my-comic-plugin
download: https://example.com/releases/my-comic-plugin.zip
```

为了防止他人登记无法验证来源的文件，首次使用普通下载地址注册插件时，只允许本注册表的维护者操作。一般用户应优先使用 GitHub 仓库地址。

### 添加多位作者

需要登记其他 GitHub 用户时，每位作者单独写一行，并在用户名之前保留 `-`：

```yaml
action: upsert
id: my-comic-plugin
download: gh:octocat/my-comic-plugin
authors:
  - octocat
  - another-author
```

注意：

- Issue 提交人无论是否写在列表中，都会自动加入作者列表。
- 新注册时不填写 `authors`，作者列表中只有提交人。
- 更新已有插件时不填写 `authors`，原作者列表保持不变。
- 更新时一旦填写 `authors`，它会替换原作者列表，而不是追加到原列表。

### 更新已有插件

更新和注册使用同一个 `upsert` 命令。填写已有插件的 `id`，再写入新的信息即可。

下面的例子把 `my-comic-plugin` 的 GitHub 仓库改为 `octocat/new-plugin-repository`：

```yaml
action: upsert
id: my-comic-plugin
download: gh:octocat/new-plugin-repository
```

更新下载来源时，提交人还必须能够管理新的 GitHub 仓库。普通登记作者不能把插件改为自己无权管理的仓库或普通下载地址。

不要通过修改 `id` 来重命名插件。不同的 `id` 会被机器人当作两个插件。需要更换 ID 时，请先用 `remove` 删除旧登记，再用 `upsert` 注册新 ID。

## `remove`：删除插件登记

### 用途

让插件不再出现在 Awesome Plugin 市场中。

删除登记不会删除 GitHub 仓库、发行版或用户电脑中已经安装的插件。

### 写法

删除时只保留 `action` 和 `id`：

```yaml
action: remove
id: my-comic-plugin
```

请务必删掉 `download` 和 `authors`。`remove` 命令包含多余内容时，机器人会拒绝执行。

## 每个字段的含义

### `action`

告诉机器人要执行哪个命令。

- `upsert`：注册或更新。
- `remove`：删除登记。

只能使用小写英文，不能写成“添加”“删除”或其他文字。

### `id`

插件在市场中的唯一名称，也是 `ap:<id>` 安装命令的一部分。

可用字符：

- 英文字母 `A-Z`、`a-z`
- 数字 `0-9`
- 连字符 `-`
- 下划线 `_`

规则：

- 必须以字母或数字开头。
- 最多 64 个字符。
- 不能包含空格、中文、斜杠 `/` 或点号 `.`。

有效示例：`bika`、`my-plugin`、`plugin_2`。

无效示例：`我的插件`、`my plugin`、`owner/repo`、`.plugin`。

### `download`

告诉市场到哪里获取插件。它只用于 `upsert`。

GitHub 仓库写法：

```yaml
download: gh:仓库所有者/仓库名称
```

普通下载地址写法：

```yaml
download: https://example.com/plugin.zip
```

不要在 `gh:` 后粘贴完整的 GitHub 网页地址。正确写法是 `gh:octocat/my-plugin`，不是 `gh:https://github.com/octocat/my-plugin`。

### `authors`

可选的 GitHub 作者列表，只用于 `upsert`。这里填写 GitHub 用户名，不是昵称、邮箱或个人主页地址。

作者用户名不能重复。每个用户名必须单独占一行。

## 谁可以操作

机器人会检查权限，避免陌生人冒领或篡改插件。

| 情况 | 谁可以操作 |
| --- | --- |
| 首次登记个人 GitHub 仓库 | 仓库所有者、经 GitHub 验证有管理权限的用户、注册表维护者 |
| 首次登记组织 GitHub 仓库 | 经 GitHub 验证有管理权限的用户、注册表维护者 |
| 首次登记普通下载地址 | 注册表维护者 |
| 更新且下载来源不变 | 已登记作者、注册表维护者 |
| 更新并更换 GitHub 仓库 | 已登记作者还需拥有新仓库管理权限，或由注册表维护者操作 |
| 更新为普通下载地址 | 注册表维护者 |
| 删除插件登记 | 已登记作者、注册表维护者 |

如果你确定自己有权限但仍看到“权限不足”，请确认提交 Issue 的 GitHub 账号是否正确，以及 GitHub 是否能识别你对目标仓库的权限。

## 看懂机器人回复

机器人会在 Issue 下方发表评论：

| 标志 | 含义 | 应该怎么做 |
| --- | --- | --- |
| ✅ 操作成功 | 注册、更新或删除已经完成 | 无需继续操作，Issue 会自动关闭 |
| 🔒 权限不足 | 当前 GitHub 账号没有所需权限 | 检查账号和仓库权限，或联系维护者 |
| ❌ 请求未执行 | 控制块格式错误、插件不存在或执行失败 | 展开日志，修改原 Issue 正文 |

每条回复底部都有“📋 执行日志”。日志默认折叠，点击标题即可展开。向维护者求助时，可以把日志内容一并提供。

## 常见问题

### 我提交后发现写错了，需要重新创建 Issue 吗？

不需要。打开原 Issue，点击正文右上角的编辑按钮，修正控制块并保存。机器人会重新处理修改后的正文。

### 为什么我在评论里写了正确内容，机器人没有重新处理？

机器人只读取 Issue 正文中的控制块，不读取评论中的命令。请编辑 Issue 正文。

### 为什么机器人说有多余字段？

`remove` 只能包含 `action` 和 `id`。执行删除时，请删除 `download` 和 `authors`。

### 为什么更新作者后，原作者不见了？

更新时填写 `authors` 会替换原列表。需要保留的原作者也必须写入新列表；提交人会自动保留。

### 为什么不能登记别人的 GitHub 仓库？

这是为了防止插件被冒领。请让仓库所有者或拥有仓库管理权限的用户提交，也可以联系注册表维护者协助。

### 删除登记后还能重新添加吗？

可以。以后再次使用 `upsert` 注册相同的 `id` 即可，但仍需通过权限检查。

## 提交前检查

- 我选择了正确的 `action`。
- `id` 没有空格、中文、斜杠或点号。
- GitHub 下载地址使用了 `gh:所有者/仓库名` 格式。
- `authors` 中填写的是 GitHub 用户名，每人单独一行。
- 使用 `remove` 时已经删除 `download` 和 `authors`。
- 我没有删除 `plugin-control` 标记和代码块边界。
- 我使用的是有权管理该插件的 GitHub 账号。
