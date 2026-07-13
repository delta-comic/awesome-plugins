import { describe, expect, test } from 'bun:test'

import { MarkdownControlParser } from '../src/control/markdown-control'

import { loadSchemas } from './helpers'

describe('MarkdownControlParser', () => {
  test('parses a marked upsert YAML block', async () => {
    const parser = new MarkdownControlParser(await loadSchemas())
    expect(
      parser.parse(`Some human context

<!-- plugin-control -->
\`\`\`yaml
action: upsert
id: example
download: gh:owner/repository
authors:
  - another-user
\`\`\``),
    ).toEqual({
      action: 'upsert',
      id: 'example',
      download: 'gh:owner/repository',
      authors: ['another-user'],
    })
  })

  test('parses remove without upsert-only fields', async () => {
    const parser = new MarkdownControlParser(await loadSchemas())
    expect(
      parser.parse(`<!-- plugin-control -->
\`\`\`yaml
action: remove
id: example
\`\`\``),
    ).toEqual({ action: 'remove', id: 'example' })
  })

  test('rejects unmarked and ambiguous control blocks', async () => {
    const parser = new MarkdownControlParser(await loadSchemas())
    expect(() => parser.parse('```yaml\naction: remove\nid: example\n```')).toThrow('exactly one')
    expect(() =>
      parser.parse(`<!-- plugin-control -->
\`\`\`yaml
action: remove
id: example
extra: true
\`\`\``),
    ).toThrow('control-request')
  })
})