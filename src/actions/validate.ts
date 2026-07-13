import { readdir } from 'node:fs/promises'
import path from 'node:path'

import { Command } from 'commander'

import type { RegistryIndex, RegistryPage } from '../domain/catalog'
import { PluginStore } from '../infrastructure/plugin-store'
import { SchemaRegistry } from '../infrastructure/schema'

const program = new Command('validate')

program.description('校验插件源数据、分页注册表和跨文件约束').action(async () => {
  const root = path.join(import.meta.dirname, '../..')
  const schemas: SchemaRegistry = await SchemaRegistry.load(path.join(root, 'schemas'))
  const plugins = await new PluginStore(path.join(root, 'pages'), schemas).list()

  const indexValue: unknown = await Bun.file(path.join(root, 'registry/index.json')).json()
  schemas.assert<RegistryIndex>('registry-index', indexValue)
  const pageDirectory = path.join(root, 'registry/pages')
  const pageFiles = (await readdir(pageDirectory)).filter(file => /^\d+\.json$/.test(file)).sort()
  const pages = await Promise.all(
    pageFiles.map(async file => {
      const value: unknown = await Bun.file(path.join(pageDirectory, file)).json()
      schemas.assert<RegistryPage>('registry-page', value)
      if (`${value.pagination.page}.json` !== file) {
        throw new TypeError(`${file} declares page ${value.pagination.page}`)
      }
      return value
    }),
  )

  const indexedItems = pages.reduce((total, page) => total + page.items.length, 0)
  if (indexValue.totalPages !== pages.length || indexValue.pages.length !== pages.length) {
    throw new TypeError('Registry index page count does not match generated page files')
  }
  if (indexValue.totalItems !== indexedItems || indexValue.totalItems !== plugins.length) {
    throw new TypeError('Registry item count does not match page items and plugin source files')
  }

  console.log(`Validated ${plugins.length} plugins across ${pages.length} registry pages.`)
})

export default program