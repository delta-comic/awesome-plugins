import { describe, expect, test } from 'vitest'

import { CatalogBuilder } from '../src/catalog/builder'
import { parseDownload } from '../src/domain/plugin'

describe('Vite+ smoke checks', () => {
  test('builds an empty paginated registry', () => {
    expect(new CatalogBuilder().build([], 20)).toEqual({
      index: { schemaVersion: 1, pageSize: 20, totalItems: 0, totalPages: 0, pages: [] },
      pages: [],
    })
  })

  test('normalizes GitHub download sources', () => {
    expect(parseDownload('gh:delta-comic/example')).toEqual({
      type: 'github',
      repository: 'delta-comic/example',
    })
  })
})