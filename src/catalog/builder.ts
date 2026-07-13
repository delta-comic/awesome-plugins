import type { PluginListing, RegistryIndex, RegistryPage } from '../domain/catalog'

export interface BuiltCatalog {
  index: RegistryIndex
  pages: RegistryPage[]
}

export class CatalogBuilder {
  build(listings: PluginListing[], pageSize: number): BuiltCatalog {
    if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new RangeError('pageSize must be an integer from 1 to 100')
    }

    const items = [...listings].sort((left, right) => left.id.localeCompare(right.id))
    const totalPages = Math.ceil(items.length / pageSize)
    const pages = Array.from({ length: totalPages }, (_, offset): RegistryPage => {
      const page = offset + 1
      return {
        schemaVersion: 1,
        pagination: {
          page,
          pageSize,
          totalItems: items.length,
          totalPages,
          previous: page > 1 ? `registry/pages/${page - 1}.json` : null,
          next: page < totalPages ? `registry/pages/${page + 1}.json` : null,
        },
        items: items.slice(offset * pageSize, page * pageSize),
      }
    })

    return {
      index: {
        schemaVersion: 1,
        pageSize,
        totalItems: items.length,
        totalPages,
        pages: pages.map(page => ({
          page: page.pagination.page,
          items: page.items.length,
          path: `registry/pages/${page.pagination.page}.json`,
        })),
      },
      pages,
    }
  }
}