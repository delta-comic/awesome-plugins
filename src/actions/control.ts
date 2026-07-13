import path from 'node:path'

import { Command } from 'commander'

import { AuthorizationPolicy } from '../control/authorization'
import { RegistryController } from '../control/controller'
import { MarkdownControlParser } from '../control/markdown-control'
import { GitHubControlGateway } from '../infrastructure/github-control-gateway'
import { PluginStore } from '../infrastructure/plugin-store'
import { SchemaRegistry } from '../infrastructure/schema'

const program = new Command('control')

program
  .description('执行 Issue 中的 Markdown 插件控制块')
  .argument('<number>', 'Issue 编号')
  .action(async value => {
    const issueNumber = Number(value)
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) {
      throw new RangeError(`Invalid issue number: ${value}`)
    }

    const root = path.join(import.meta.dirname, '../..')
    const schemas = await SchemaRegistry.load(path.join(root, 'schemas'))
    const gateway = new GitHubControlGateway()
    const controller = new RegistryController(
      gateway,
      new MarkdownControlParser(schemas),
      new PluginStore(path.join(root, 'pages'), schemas),
      new AuthorizationPolicy(
        gateway,
        process.env.GITHUB_REPOSITORY ?? 'delta-comic/awesome-plugins',
      ),
    )
    await controller.execute(issueNumber)
  })

export default program