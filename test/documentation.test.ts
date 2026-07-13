import { describe, expect, test } from 'bun:test'
import path from 'node:path'

import { MarkdownControlParser } from '../src/control/markdown-control'

import { loadSchemas, projectRoot } from './helpers'

describe('plugin control documentation', () => {
  test('keeps the default Issue template machine-readable', async () => {
    const template = await Bun.file(
      path.join(projectRoot, '.github/ISSUE_TEMPLATE/plugin-control.md'),
    ).text()
    const parser = new MarkdownControlParser(await loadSchemas())

    expect(parser.parse(template)).toEqual({
      action: 'upsert',
      id: 'replace-with-plugin-id',
      download: 'gh:owner/repository',
    })
    expect(template).toContain('| 命令 | 用途 | 必须填写 | 可选内容 | 注意事项 |')
    expect(template).toContain('| `upsert` | 注册新插件，或更新已有插件 |')
    expect(template).toContain('| `remove` | 从市场中删除插件登记 |')
    expect(template).toContain('### 注册或更新插件，并登记其他作者')
    expect(template).toContain('### 删除插件登记')
    expect(template).toContain('## 请在这里填写')
  })

  test('documents every command and response state', async () => {
    const guide = await Bun.file(
      path.join(projectRoot, 'docs/plugin-issue-control-guide.md'),
    ).text()

    expect(guide).toContain('## `upsert`：注册或更新插件')
    expect(guide).toContain('## `remove`：删除插件登记')
    expect(guide).toContain('## 每个字段的含义')
    expect(guide).toContain('## 谁可以操作')
    expect(guide).toContain('## 看懂机器人回复')
    expect(guide).toContain('## 常见问题')
  })
})