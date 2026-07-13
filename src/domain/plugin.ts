export const PLUGIN_ID_PATTERN = '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'

export interface GitHubDownload {
  type: 'github'
  repository: string
}

export interface UrlDownload {
  type: 'url'
  url: string
}

export type PluginDownload = GitHubDownload | UrlDownload

export interface PluginRegistration {
  schemaVersion: 1
  id: string
  authors: string[]
  download: PluginDownload
}

export interface UpsertControlRequest {
  action: 'upsert'
  id: string
  download: string
  authors?: string[]
}

export interface RemoveControlRequest {
  action: 'remove'
  id: string
}

export type ControlRequest = RemoveControlRequest | UpsertControlRequest

export const parseDownload = (value: string): PluginDownload => {
  if (value.startsWith('gh:')) {
    return { type: 'github', repository: value.slice(3) }
  }

  return { type: 'url', url: value }
}

export const serializeDownload = (download: PluginDownload) =>
  download.type === 'github' ? `gh:${download.repository}` : download.url

export const sameDownload = (left: PluginDownload, right: PluginDownload) =>
  serializeDownload(left) === serializeDownload(right)