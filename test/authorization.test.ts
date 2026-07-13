import { describe, expect, test } from 'bun:test'

import { AuthorizationPolicy, type PermissionLookup } from '../src/control/authorization'
import type { PluginRegistration } from '../src/domain/plugin'

class FakePermissions implements PermissionLookup {
  constructor(private readonly grants: string[] = []) {}

  async hasRepositoryWritePermission(repository: string, login: string) {
    return this.grants.includes(`${repository}:${login}`)
  }
}

const plugin = (repository: string): PluginRegistration => ({
  schemaVersion: 1,
  id: 'example',
  authors: ['alice'],
  download: { type: 'github', repository },
})

describe('AuthorizationPolicy', () => {
  test('prevents an unrelated user from claiming a GitHub repository', async () => {
    const policy = new AuthorizationPolicy(new FakePermissions(), 'registry/catalog')
    expect(await policy.canUpsert(undefined, plugin('alice/plugin'), 'mallory')).toBeFalse()
  })

  test('allows a personal repository owner to register', async () => {
    const policy = new AuthorizationPolicy(new FakePermissions(), 'registry/catalog')
    expect(await policy.canUpsert(undefined, plugin('alice/plugin'), 'alice')).toBeTrue()
  })

  test('requires control of a replacement source even for an existing author', async () => {
    const policy = new AuthorizationPolicy(new FakePermissions(), 'registry/catalog')
    expect(
      await policy.canUpsert(plugin('alice/plugin'), plugin('bob/plugin'), 'alice'),
    ).toBeFalse()
  })

  test('allows verified repository and registry maintainers', async () => {
    const permissions = new FakePermissions([
      'organization/plugin:bob',
      'registry/catalog:maintainer',
    ])
    const policy = new AuthorizationPolicy(permissions, 'registry/catalog')
    expect(await policy.canUpsert(undefined, plugin('organization/plugin'), 'bob')).toBeTrue()
    expect(await policy.canRemove(plugin('organization/plugin'), 'maintainer')).toBeTrue()
  })

  test('only maintainers can initially register a direct URL', async () => {
    const direct: PluginRegistration = {
      ...plugin('alice/plugin'),
      download: { type: 'url', url: 'https://example.com/plugin.zip' },
    }
    const policy = new AuthorizationPolicy(
      new FakePermissions(['registry/catalog:maintainer']),
      'registry/catalog',
    )
    expect(await policy.canUpsert(undefined, direct, 'alice')).toBeFalse()
    expect(await policy.canUpsert(undefined, direct, 'maintainer')).toBeTrue()
  })
})