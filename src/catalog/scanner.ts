import { readdir, rm } from 'node:fs/promises'
import path from 'node:path'

import type { PluginListing } from '../domain/catalog'
import type { PluginMetadataProvider } from '../infrastructure/github-metadata'
import type { PluginStore, JsonFileWriter } from '../infrastructure/plugin-store'

import { CatalogBuilder } from './builder'
import { renderReadme, type ReadmeListing } from './readme'

export interface ScanResult {
  plugins: number
  githubPlugins: number
  readmePlugins: number
  pages: number
}

export class CatalogScanner {
  constructor(
    private readonly rootDirectory: string,
    private readonly registry: PluginStore,
    private readonly writer: JsonFileWriter,
    private readonly metadata: PluginMetadataProvider,
    private readonly builder = new CatalogBuilder(),
  ) {}

  async scan(pageSize = 20): Promise<ScanResult> {
    const registrations = await this.registry.list()
    const listings = await Promise.all(
      registrations.map(async (plugin): Promise<PluginListing> => {
        if (plugin.download.type !== 'github') return plugin
        const inspection = await this.metadata.inspect(plugin.download.repository)
        return { ...plugin, ...inspection }
      }),
    )

    const recent = listings
      .filter((plugin): plugin is PluginListing & Required<Pick<PluginListing, 'repository'>> =>
        Boolean(plugin.repository),
      )
      .sort(
        (left, right) =>
          Date.parse(right.repository.lastCommitAt) - Date.parse(left.repository.lastCommitAt),
      )
      .slice(0, 5)
    const readmeListings: ReadmeListing[] = await Promise.all(
      recent.map(async plugin => {
        const readme = await this.metadata.readme(
          plugin.download.type === 'github' ? plugin.download.repository : '',
        )
        if (readme) plugin.repository.readmeUrl = readme.url
        return { plugin, ...(readme ? { readme } : {}) }
      }),
    )

    const catalog = this.builder.build(listings, pageSize)
    await Promise.all([
      this.writer.write('registry/index.json', 'registry-index', catalog.index),
      ...catalog.pages.map(page =>
        this.writer.write(`registry/pages/${page.pagination.page}.json`, 'registry-page', page),
      ),
    ])
    await this.#removeStalePages(catalog.pages.length)

    const readmePath = path.join(this.rootDirectory, 'README.md')
    const readme = renderReadme(await Bun.file(readmePath).text(), readmeListings)
    await Bun.write(readmePath, readme)

    return {
      plugins: listings.length,
      githubPlugins: listings.filter(plugin => plugin.download.type === 'github').length,
      readmePlugins: readmeListings.length,
      pages: catalog.pages.length,
    }
  }

  async #removeStalePages(pageCount: number) {
    const directory = path.join(this.rootDirectory, 'registry/pages')
    const files = await readdir(directory).catch(error => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    })
    await Promise.all(
      files
        .filter(file => /^\d+\.json$/.test(file) && Number.parseInt(file, 10) > pageCount)
        .map(file => rm(path.join(directory, file))),
    )
  }
}