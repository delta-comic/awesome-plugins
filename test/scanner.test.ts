import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { CatalogScanner } from '../src/catalog/scanner'
import type { PluginMetadataProvider } from '../src/infrastructure/github-metadata'
import { JsonFileWriter, PluginStore } from '../src/infrastructure/plugin-store'

import { loadSchemas } from './helpers'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true })),
  )
})

describe('CatalogScanner', () => {
  test('renders only the five most recently committed GitHub plugins', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'awesome-plugins-scan-'))
    temporaryDirectories.push(root)
    await Bun.write(path.join(root, 'README.md'), '# Registry\n\n<!-- Gen -->\n')
    const schemas = await loadSchemas()
    const store = new PluginStore(path.join(root, 'pages'), schemas)
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) {
      await store.save({
        schemaVersion: 1,
        id,
        authors: ['alice'],
        download: { type: 'github', repository: `alice/${id}` },
      })
    }

    const readmeCalls: string[] = []
    const metadata: PluginMetadataProvider = {
      inspect: async repository => {
        const name = repository.split('/')[1] ?? 'unknown'
        return {
          repository: {
            owner: 'alice',
            name,
            url: `https://github.com/${repository}`,
            defaultBranch: 'main',
            lastCommitAt: `2026-07-${String(name.charCodeAt(0) - 90).padStart(2, '0')}T00:00:00Z`,
          },
        }
      },
      readme: async repository => {
        readmeCalls.push(repository)
        return {
          content: `README for ${repository}`,
          url: `https://github.com/${repository}#readme`,
        }
      },
    }
    const scanner = new CatalogScanner(root, store, new JsonFileWriter(root, schemas), metadata)
    const result = await scanner.scan(2)

    expect(result).toEqual({ plugins: 6, githubPlugins: 6, readmePlugins: 5, pages: 3 })
    expect(readmeCalls).toEqual(['alice/f', 'alice/e', 'alice/d', 'alice/c', 'alice/b'])
    const readme = await Bun.file(path.join(root, 'README.md')).text()
    expect(readme).toContain('### f')
    expect(readme).not.toContain('### a')
    const index = await Bun.file(path.join(root, 'registry/index.json')).json()
    expect(index.pages).toHaveLength(3)
  })
})