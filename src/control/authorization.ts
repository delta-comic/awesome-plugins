import type { PluginRegistration } from '../domain/plugin'
import { sameDownload } from '../domain/plugin'

export interface PermissionLookup {
  hasRepositoryWritePermission(repository: string, login: string): Promise<boolean>
}

export class AuthorizationPolicy {
  constructor(
    private readonly permissions: PermissionLookup,
    private readonly registryRepository: string,
  ) {}

  async canUpsert(
    existing: PluginRegistration | undefined,
    proposed: PluginRegistration,
    actor: string,
  ) {
    if (await this.#isRegistryMaintainer(actor)) return true

    if (!existing) return this.#canControlDownload(proposed, actor)
    if (!existing.authors.some(author => author.toLowerCase() === actor.toLowerCase())) return false
    if (sameDownload(existing.download, proposed.download)) return true
    return this.#canControlDownload(proposed, actor)
  }

  async canRemove(existing: PluginRegistration, actor: string) {
    if (existing.authors.some(author => author.toLowerCase() === actor.toLowerCase())) return true
    return this.#isRegistryMaintainer(actor)
  }

  #isRegistryMaintainer(actor: string) {
    return this.permissions.hasRepositoryWritePermission(this.registryRepository, actor)
  }

  #canControlDownload(plugin: PluginRegistration, actor: string) {
    if (plugin.download.type !== 'github') return Promise.resolve(false)
    const [owner] = plugin.download.repository.split('/')
    if (owner?.toLowerCase() === actor.toLowerCase()) return Promise.resolve(true)
    return this.permissions.hasRepositoryWritePermission(plugin.download.repository, actor)
  }
}