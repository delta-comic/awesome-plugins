import { Buffer } from 'node:buffer'

import JSZip from 'jszip'
import { Octokit } from 'octokit'

import type { ReleaseMetadata, RepositoryMetadata } from '../domain/catalog'

export interface GitHubInspection {
  repository: RepositoryMetadata
  release?: ReleaseMetadata
}

export interface RepositoryReadme {
  content: string
  url: string
}

export interface PluginMetadataProvider {
  inspect(repository: string): Promise<GitHubInspection>
  readme(repository: string): Promise<RepositoryReadme | undefined>
}

type Fetcher = (url: string) => Promise<Response>

const splitRepository = (repository: string): [owner: string, repo: string] => {
  const [owner, repo] = repository.split('/')
  if (!owner || !repo) throw new TypeError(`Invalid GitHub repository: ${repository}`)
  return [owner, repo]
}

export class GitHubMetadataProvider implements PluginMetadataProvider {
  constructor(
    private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }),
    private readonly fetcher: Fetcher = globalThis.fetch,
  ) {}

  async inspect(repository: string): Promise<GitHubInspection> {
    const [owner, repo] = splitRepository(repository)
    const [{ data }, commits] = await Promise.all([
      this.octokit.rest.repos.get({ owner, repo }),
      this.octokit.rest.repos.listCommits({ owner, repo, per_page: 1 }),
    ])
    const lastCommitAt =
      commits.data[0]?.commit.committer?.date ??
      commits.data[0]?.commit.author?.date ??
      data.pushed_at
    if (!lastCommitAt) throw new Error(`GitHub did not return a commit time for ${repository}`)

    const release = await this.#latestRelease(owner, repo)
    return {
      repository: {
        owner: data.owner.login,
        name: data.name,
        url: data.html_url,
        defaultBranch: data.default_branch,
        lastCommitAt,
      },
      ...(release ? { release } : {}),
    }
  }

  async readme(repository: string): Promise<RepositoryReadme | undefined> {
    const [owner, repo] = splitRepository(repository)
    try {
      const { data } = await this.octokit.rest.repos.getReadme({ owner, repo })
      return {
        content: Buffer.from(data.content, 'base64').toString('utf8'),
        url: data.html_url ?? `https://github.com/${owner}/${repo}#readme`,
      }
    } catch (error) {
      if ((error as { status?: number }).status === 404) return undefined
      throw error
    }
  }

  async #latestRelease(owner: string, repo: string): Promise<ReleaseMetadata | undefined> {
    try {
      const { data } = await this.octokit.rest.repos.getLatestRelease({ owner, repo })
      const publishedAt = data.published_at ?? data.created_at
      const asset = data.assets.find(item => item.name.toLowerCase() === 'manifest.json')
      const rootManifestUrl = asset
        ? undefined
        : await this.#rootManifest(owner, repo, data.tag_name)
      const archivedManifest =
        asset || rootManifestUrl ? undefined : await this.#archivedManifest(data.assets)
      return {
        version: data.tag_name,
        url: data.html_url,
        publishedAt,
        ...(asset ? { manifestUrl: asset.browser_download_url } : {}),
        ...(rootManifestUrl ? { manifestUrl: rootManifestUrl } : {}),
        ...archivedManifest,
      }
    } catch (error) {
      if ((error as { status?: number }).status === 404) return undefined
      throw error
    }
  }

  async #rootManifest(owner: string, repo: string, reference: string) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'manifest.json',
        ref: reference,
      })
      return Array.isArray(data) ? undefined : (data.download_url ?? undefined)
    } catch (error) {
      if ((error as { status?: number }).status === 404) return undefined
      throw error
    }
  }

  async #archivedManifest(
    assets: Array<{ name: string; browser_download_url: string; size: number }>,
  ): Promise<Pick<ReleaseMetadata, 'manifestPath' | 'manifestUrl'> | undefined> {
    const candidates = assets.filter(
      asset => asset.name.toLowerCase().endsWith('.zip') && asset.size <= 50 * 1024 * 1024,
    )
    for (const asset of candidates) {
      const response = await this.fetcher(asset.browser_download_url)
      if (!response.ok) {
        throw new Error(`Unable to download release asset ${asset.browser_download_url}`)
      }
      const archive = await JSZip.loadAsync(await response.arrayBuffer())
      const manifest = Object.values(archive.files).find(
        file => !file.dir && file.name.toLowerCase().split('/').at(-1) === 'manifest.json',
      )
      if (!manifest) continue

      const value: unknown = JSON.parse(await manifest.async('string'))
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      return { manifestUrl: asset.browser_download_url, manifestPath: manifest.name }
    }
    return undefined
  }
}