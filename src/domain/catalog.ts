import type { PluginRegistration } from './plugin'

export interface RepositoryMetadata {
  owner: string
  name: string
  url: string
  defaultBranch: string
  lastCommitAt: string
  readmeUrl?: string
}

export interface ReleaseMetadata {
  version: string
  url: string
  publishedAt: string
  manifestUrl?: string
}

export interface PluginListing extends PluginRegistration {
  repository?: RepositoryMetadata
  release?: ReleaseMetadata
}

export interface RegistryPage {
  schemaVersion: 1
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    previous: string | null
    next: string | null
  }
  items: PluginListing[]
}

export interface RegistryIndex {
  schemaVersion: 1
  pageSize: number
  totalItems: number
  totalPages: number
  pages: Array<{ page: number; items: number; path: string }>
}