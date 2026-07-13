import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { PluginStore } from '../src/infrastructure/plugin-store'

import { loadSchemas } from './helpers'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true })),
  )
})

describe('PluginStore', () => {
  test('validates and writes normalized records', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'awesome-plugins-'))
    temporaryDirectories.push(directory)
    const store = new PluginStore(directory, await loadSchemas())
    await store.save({
      schemaVersion: 1,
      id: 'example',
      authors: ['alice'],
      download: { type: 'github', repository: 'alice/example' },
    })

    expect(await store.find('example')).toEqual({
      schemaVersion: 1,
      id: 'example',
      authors: ['alice'],
      download: { type: 'github', repository: 'alice/example' },
    })
    expect(await readFile(path.join(directory, 'example.json'), 'utf8')).toEndWith('\n')
  })

  test('rejects invalid records before creating a file', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'awesome-plugins-'))
    temporaryDirectories.push(directory)
    const store = new PluginStore(directory, await loadSchemas())

    expect(
      store.save({
        schemaVersion: 1,
        id: '../escape',
        authors: [],
        download: { type: 'github', repository: 'invalid' },
      }),
    ).rejects.toThrow('plugin-registration')
    expect(await Bun.file(path.join(directory, 'escape.json')).exists()).toBeFalse()
  })
})