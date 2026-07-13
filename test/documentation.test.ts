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