import { Buffer } from 'node:buffer'

import { Octokit } from '@octokit/action'

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

const splitRepository = (repository: string): [owner: string, repo: string] => {
  const [owner, repo] = repository.split('/')
  if (!owner || !repo) throw new TypeError(`Invalid GitHub repository: ${repository}`)
  return [owner, repo]
}

export class GitHubMetadataProvider implements PluginMetadataProvider {
  constructor(private readonly octokit = new Octokit()) {}

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
        owner,
        name: repo,
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
      const manifestUrl =
        asset?.browser_download_url ?? (await this.#rootManifest(owner, repo, data.tag_name))
      return {
        version: data.tag_name,
        url: data.html_url,
        publishedAt,
        ...(manifestUrl ? { manifestUrl } : {}),
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
}