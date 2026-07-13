import type { ControlRequest, PluginRegistration } from '../domain/plugin'
import { parseDownload, serializeDownload } from '../domain/plugin'
import type { PluginStore } from '../infrastructure/plugin-store'

import type { AuthorizationPolicy } from './authorization'
import type { MarkdownControlParser } from './markdown-control'
import { OperationLog, renderReport, type ReportKind } from './reporter'

export interface ControlIssue {
  number: number
  body: string
  actor: string
}

export interface ControlGateway {
  getIssue(number: number): Promise<ControlIssue>
  wasProcessed(issueNumber: number, bodyHash: string): Promise<boolean>
  comment(issueNumber: number, body: string): Promise<void>
  close(issueNumber: number): Promise<void>
}

export class RegistryController {
  constructor(
    private readonly gateway: ControlGateway,
    private readonly parser: MarkdownControlParser,
    private readonly registry: PluginStore,
    private readonly authorization: AuthorizationPolicy,
  ) {}

  async execute(issueNumber: number) {
    const issue = await this.gateway.getIssue(issueNumber)
    const bodyHash = new Bun.CryptoHasher('sha256').update(issue.body).digest('hex')
    if (await this.gateway.wasProcessed(issue.number, bodyHash)) return

    const log = new OperationLog()
    log.info(`Loaded issue #${issue.number} from ${issue.actor}`)

    try {
      const request = this.parser.parse(issue.body)
      log.info(`Parsed ${request.action} request for ${request.id}`)
      if (request.action === 'remove') {
        await this.#remove(issue, request, bodyHash, log)
      } else {
        await this.#upsert(issue, request, bodyHash, log)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.error(message)
      await this.#report(
        issue.number,
        'error',
        `无法解析或执行控制块：${message}`,
        log,
        bodyHash,
        false,
      )
    }
  }

  async #upsert(
    issue: ControlIssue,
    request: Extract<ControlRequest, { action: 'upsert' }>,
    bodyHash: string,
    log: OperationLog,
  ) {
    const existing = await this.registry.find(request.id)
    const authors = this.#authors(request.authors ?? existing?.authors ?? [], issue.actor)
    const plugin: PluginRegistration = {
      schemaVersion: 1,
      id: request.id,
      authors,
      download: parseDownload(request.download),
    }

    if (!(await this.authorization.canUpsert(existing, plugin, issue.actor))) {
      log.error('Actor is not authorized to create, update, or change this plugin source')
      await this.#report(
        issue.number,
        'forbidden',
        '只有登记作者、目标 GitHub 仓库的可验证维护者或本注册表维护者可以执行此操作。',
        log,
        bodyHash,
        false,
      )
      return
    }

    await this.registry.save(plugin)
    log.info(`Validated and wrote pages/${plugin.id}.json`)
    await this.#report(
      issue.number,
      'success',
      `${existing ? '已更新' : '已注册'}插件 \`${plugin.id}\`。

- 下载：\`${serializeDownload(plugin.download)}\`
- 作者：${plugin.authors.map(author => `@${author}`).join('、')}`,
      log,
      bodyHash,
      true,
    )
  }

  async #remove(
    issue: ControlIssue,
    request: Extract<ControlRequest, { action: 'remove' }>,
    bodyHash: string,
    log: OperationLog,
  ) {
    const existing = await this.registry.find(request.id)
    if (!existing) {
      log.error('Plugin does not exist')
      await this.#report(
        issue.number,
        'error',
        `注册表中不存在插件 \`${request.id}\`。`,
        log,
        bodyHash,
        false,
      )
      return
    }

    if (!(await this.authorization.canRemove(existing, issue.actor))) {
      log.error('Actor is not an author or registry maintainer')
      await this.#report(
        issue.number,
        'forbidden',
        '只有登记作者或本注册表维护者可以删除该插件。',
        log,
        bodyHash,
        false,
      )
      return
    }

    await this.registry.remove(request.id)
    log.info(`Removed pages/${request.id}.json`)
    await this.#report(
      issue.number,
      'success',
      `已从注册表删除插件 \`${request.id}\`。`,
      log,
      bodyHash,
      true,
    )
  }

  async #report(
    issueNumber: number,
    kind: ReportKind,
    summary: string,
    log: OperationLog,
    bodyHash: string,
    close: boolean,
  ) {
    await this.gateway.comment(issueNumber, renderReport(kind, summary, log, bodyHash))
    if (close) await this.gateway.close(issueNumber)
  }

  #authors(requested: string[], actor: string) {
    return Array.from(new Set([...requested, actor].map(author => author.trim()).filter(Boolean)))
  }
}