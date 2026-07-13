import { describe, expect, test } from 'bun:test'

import { GitHubMetadataProvider } from '../src/infrastructure/github-metadata'

interface FakeOptions {
  assets: Array<{ name: string; browser_download_url: string }>
  tree?: Array<{ path: string; type: string }>
}

const fakeOctokit = ({ assets, tree = [] }: FakeOptions) => ({
  rest: {
    repos: {
      get: async () => ({
        data: {
          owner: { login: 'renamed-owner' },
          name: 'renamed-repository',
          html_url: 'https://github.com/renamed-owner/renamed-repository',
          default_branch: 'main',
          pushed_at: '2026-07-01T00:00:00Z',
        },
      }),
      listCommits: async () => ({
        data: [{ commit: { committer: { date: '2026-07-12T00:00:00Z' } } }],
      }),
      getLatestRelease: async () => ({
        data: {
          tag_name: 'v1.0.0',
          html_url: 'https://github.com/renamed-owner/renamed-repository/releases/v1.0.0',
          published_at: '2026-07-11T00:00:00Z',
          created_at: '2026-07-10T00:00:00Z',
          assets,
        },
      }),
      getCommit: async () => ({ data: { commit: { tree: { sha: 'tree-sha' } } } }),
    },
    git: { getTree: async () => ({ data: { tree } }) },
  },
})

const expectedRepository = {
  owner: 'renamed-owner',
  name: 'renamed-repository',
  url: 'https://github.com/renamed-owner/renamed-repository',
  defaultBranch: 'main',
  lastCommitAt: '2026-07-12T00:00:00Z',
}

describe('GitHubMetadataProvider', () => {
  test('keeps the direct URL of a manifest.json release asset', async () => {
    const provider = new GitHubMetadataProvider(
      fakeOctokit({
        assets: [
          { name: 'manifest.json', browser_download_url: 'https://example.com/manifest.json' },
        ],
      }) as never,
    )

    expect(await provider.inspect('old-owner/old-repository')).toEqual({
      repository: expectedRepository,
      release: {
        version: 'v1.0.0',
        url: 'https://github.com/renamed-owner/renamed-repository/releases/v1.0.0',
        publishedAt: '2026-07-11T00:00:00Z',
        manifestUrl: 'https://example.com/manifest.json',
      },
    })
  })

  test('constructs a direct link from release tag tree metadata', async () => {
    const provider = new GitHubMetadataProvider(
      fakeOctokit({ assets: [], tree: [{ path: 'manifest.json', type: 'blob' }] }) as never,
    )

    expect((await provider.inspect('old-owner/old-repository')).release?.manifestUrl).toBe(
      'https://raw.githubusercontent.com/renamed-owner/renamed-repository/v1.0.0/manifest.json',
    )
  })

  test('does not treat a ZIP release asset as a manifest link', async () => {
    const provider = new GitHubMetadataProvider(
      fakeOctokit({
        assets: [{ name: 'plugin.zip', browser_download_url: 'https://example.com/plugin.zip' }],
      }) as never,
    )

    expect((await provider.inspect('old-owner/old-repository')).release).toEqual({
      version: 'v1.0.0',
      url: 'https://github.com/renamed-owner/renamed-repository/releases/v1.0.0',
      publishedAt: '2026-07-11T00:00:00Z',
    })
  })
})