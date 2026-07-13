import { Buffer } from 'node:buffer'

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

const splitRepository = (repository: string): [owner: string, repo: string] => {
  const [owner, repo] = repository.split('/')
  if (!owner || !repo) throw new TypeError(`Invalid GitHub repository: ${repository}`)
  return [owner, repo]
}

export class GitHubMetadataProvider implements PluginMetadataProvider {
  constructor(private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })) {}

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

    const release = await this.#latestRelease(data.owner.login, data.name)
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
      return {
        version: data.tag_name,
        url: data.html_url,
        publishedAt,
        ...(asset ? { manifestUrl: asset.browser_download_url } : {}),
        ...(rootManifestUrl ? { manifestUrl: rootManifestUrl } : {}),
      }
    } catch (error) {
      if ((error as { status?: number }).status === 404) return undefined
      throw error
    }
  }

  async #rootManifest(owner: string, repo: string, reference: string) {
    try {
      const { data: commit } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: reference,
      })
      const { data: tree } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: commit.commit.tree.sha,
      })
      const manifest = tree.tree.find(
        item => item.type === 'blob' && item.path?.toLowerCase() === 'manifest.json',
      )
      if (!manifest?.path) return undefined

      const encodedReference = reference.split('/').map(encodeURIComponent).join('/')
      const encodedPath = manifest.path.split('/').map(encodeURIComponent).join('/')
      return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodedReference}/${encodedPath}`
    } catch (error) {
      if ((error as { status?: number }).status === 404) return undefined
      throw error
    }
  }
}