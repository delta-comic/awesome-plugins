import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { AuthorizationPolicy, type PermissionLookup } from '../src/control/authorization'
import {
  RegistryController,
  type ControlGateway,
  type ControlIssue,
} from '../src/control/controller'
import { MarkdownControlParser } from '../src/control/markdown-control'
import { PluginStore } from '../src/infrastructure/plugin-store'

import { loadSchemas } from './helpers'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true })),
  )
})

class FakeGateway implements ControlGateway, PermissionLookup {
  readonly comments: string[] = []
  closed = false

  constructor(
    private readonly issue: ControlIssue,
    private readonly grants: string[] = [],
  ) {}

  async getIssue() {
    return this.issue
  }

  async wasProcessed() {
    return false
  }

  async comment(_issueNumber: number, body: string) {
    this.comments.push(body)
  }

  async close() {
    this.closed = true
  }

  async hasRepositoryWritePermission(repository: string, login: string) {
    return this.grants.includes(`${repository}:${login}`)
  }
}

const issue = (actor: string): ControlIssue => ({
  number: 42,
  actor,
  body: `<!-- plugin-control -->
\`\`\`yaml
action: upsert
id: example
download: gh:alice/example
\`\`\``,
})

const setup = async (actor: string) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'awesome-plugins-control-'))
  temporaryDirectories.push(directory)
  const schemas = await loadSchemas()
  const gateway = new FakeGateway(issue(actor))
  const store = new PluginStore(directory, schemas)
  const controller = new RegistryController(
    gateway,
    new MarkdownControlParser(schemas),
    store,
    new AuthorizationPolicy(gateway, 'delta-comic/awesome-plugins'),
  )
  return { controller, gateway, store }
}

describe('RegistryController', () => {
  test('registers a repository owned by the issue author', async () => {
    const { controller, gateway, store } = await setup('alice')
    await controller.execute(42)

    expect(await store.find('example')).toEqual({
      schemaVersion: 1,
      id: 'example',
      authors: ['alice'],
      download: { type: 'github', repository: 'alice/example' },
    })
    expect(gateway.closed).toBeTrue()
    expect(gateway.comments[0]).toContain('## ✅ 操作成功')
    expect(gateway.comments[0]).toContain('<summary>📋 执行日志</summary>')
  })

  test('rejects an unrelated user claiming another repository', async () => {
    const { controller, gateway, store } = await setup('mallory')
    await controller.execute(42)

    expect(await store.find('example')).toBeUndefined()
    expect(gateway.closed).toBeFalse()
    expect(gateway.comments[0]).toContain('## 🔒 权限不足')
  })
})