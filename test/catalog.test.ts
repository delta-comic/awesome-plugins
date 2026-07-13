import { describe, expect, test } from 'bun:test'

import { CatalogBuilder } from '../src/catalog/builder'
import { README_GENERATED_MARKER, renderReadme } from '../src/catalog/readme'
import type { PluginListing } from '../src/domain/catalog'

const listing = (id: string): PluginListing => ({
  schemaVersion: 1,
  id,
  authors: ['alice'],
  download: { type: 'github', repository: `alice/${id}` },
  repository: {
    owner: 'alice',
    name: id,
    url: `https://github.com/alice/${id}`,
    defaultBranch: 'main',
    lastCommitAt: '2026-07-13T00:00:00Z',
  },
})

describe('CatalogBuilder', () => {
  test('sorts deterministically and builds navigation metadata', () => {
    const catalog = new CatalogBuilder().build([listing('c'), listing('a'), listing('b')], 2)
    expect(catalog.index).toEqual({
      schemaVersion: 1,
      pageSize: 2,
      totalItems: 3,
      totalPages: 2,
      pages: [
        { page: 1, items: 2, path: 'registry/pages/1.json' },
        { page: 2, items: 1, path: 'registry/pages/2.json' },
      ],
    })
    expect(catalog.pages[0]?.items.map(item => item.id)).toEqual(['a', 'b'])
    expect(catalog.pages[0]?.pagination).toMatchObject({
      previous: null,
      next: 'registry/pages/2.json',
    })
    expect(catalog.pages[1]?.pagination).toMatchObject({
      previous: 'registry/pages/1.json',
      next: null,
    })
  })
})

describe('renderReadme', () => {
  test('replaces the legacy section and renders a folded repository README', () => {
    const output = renderReadme('# Intro\n\n<!-- Gen -->\n\nold content', [
      {
        plugin: listing('example'),
        readme: { content: '# Plugin docs\n\nHello', url: 'https://example.com' },
      },
    ])
    expect(output).toContain(README_GENERATED_MARKER)
    expect(output).not.toContain('old content')
    expect(output).toContain('### example')
    expect(output).toContain('ap:example')
    expect(output).toContain('<details>')
    expect(output).toContain('# Plugin docs')
  })
})