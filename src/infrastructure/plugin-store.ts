import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

import type { PluginRegistration } from '../domain/plugin'

import type { SchemaName, SchemaRegistry } from './schema'

export class JsonFileWriter {
  constructor(
    private readonly rootDirectory: string,
    private readonly schemas: SchemaRegistry,
  ) {}

  async write<T>(relativePath: string, schema: SchemaName, value: T) {
    this.schemas.assert<T>(schema, value)
    const destination = path.join(this.rootDirectory, relativePath)
    await mkdir(path.dirname(destination), { recursive: true })
    await Bun.write(destination, `${JSON.stringify(value, null, 2)}\n`)
  }
}

export class PluginStore {
  readonly #writer: JsonFileWriter

  constructor(
    private readonly directory: string,
    private readonly schemas: SchemaRegistry,
  ) {
    this.#writer = new JsonFileWriter(directory, schemas)
  }

  async find(id: string): Promise<PluginRegistration | undefined> {
    const file = Bun.file(this.#path(id))
    if (!(await file.exists())) return undefined

    const value: unknown = await file.json()
    this.schemas.assert<PluginRegistration>('plugin-registration', value)
    return value
  }

  async list(): Promise<PluginRegistration[]> {
    const entries = await readdir(this.directory, { withFileTypes: true }).catch(error => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    })
    const pluginFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    const plugins = await Promise.all(
      pluginFiles.map(async entry => {
        const fileId = entry.name.slice(0, -5)
        const plugin = await this.find(fileId)
        if (plugin && plugin.id !== fileId) {
          throw new TypeError(`${entry.name} declares a mismatched plugin id: ${plugin.id}`)
        }
        return plugin
      }),
    )
    return plugins.filter(plugin => plugin !== undefined).sort((a, b) => a.id.localeCompare(b.id))
  }

  save(plugin: PluginRegistration) {
    return this.#writer.write(`${plugin.id}.json`, 'plugin-registration', plugin)
  }

  async remove(id: string) {
    await rm(this.#path(id), { force: true })
  }

  #path(id: string) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id)) {
      throw new RangeError(`Invalid plugin id: ${id}`)
    }
    return path.join(this.directory, `${id}.json`)
  }
}