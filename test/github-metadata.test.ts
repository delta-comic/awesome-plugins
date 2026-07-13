import { describe, expect, test } from 'bun:test'

import JSZip from 'jszip'

import { GitHubMetadataProvider } from '../src/infrastructure/github-metadata'

describe('GitHubMetadataProvider', () => {
  test('finds manifest.json inside a release ZIP asset', async () => {
    const archive = new JSZip()
    archive.file('dist/manifest.json', JSON.stringify({ name: { id: 'example' } }))
    archive.file('dist/index.js', 'export {}')
    const bytes = await archive.generateAsync({ type: 'uint8array' })

    const octokit = {
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
              assets: [
                {
                  name: 'plugin.zip',
                  size: bytes.byteLength,
                  browser_download_url: 'https://example.com/plugin.zip',
                },
              ],
            },
          }),
          getContent: async () => {
            throw Object.assign(new Error('Not found'), { status: 404 })
          },
        },
      },
    }
    const provider = new GitHubMetadataProvider(
      octokit as never,
      async () => new Response(bytes.slice().buffer as ArrayBuffer),
    )

    expect(await provider.inspect('old-owner/old-repository')).toEqual({
      repository: {
        owner: 'renamed-owner',
        name: 'renamed-repository',
        url: 'https://github.com/renamed-owner/renamed-repository',
        defaultBranch: 'main',
        lastCommitAt: '2026-07-12T00:00:00Z',
      },
      release: {
        version: 'v1.0.0',
        url: 'https://github.com/renamed-owner/renamed-repository/releases/v1.0.0',
        publishedAt: '2026-07-11T00:00:00Z',
        manifestUrl: 'https://example.com/plugin.zip',
        manifestPath: 'dist/manifest.json',
      },
    })
  })
})