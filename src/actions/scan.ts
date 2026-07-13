import path from 'node:path'

import { Command, Option } from 'commander'
import { Octokit } from 'octokit'

import { CatalogScanner } from '../catalog/scanner'
import { GitHubMetadataProvider } from '../infrastructure/github-metadata'
import { JsonFileWriter, PluginStore } from '../infrastructure/plugin-store'
import { SchemaRegistry } from '../infrastructure/schema'

const program = new Command('scan')

program
  .description('扫描 GitHub 插件并生成分页注册表和 README')
  .addOption(new Option('--page-size <size>', '每页插件数量').default('20'))
  .action(async ({ pageSize }: { pageSize: string }) => {
    const size = Number(pageSize)
    const root = path.join(import.meta.dirname, '../..')
    const schemas = await SchemaRegistry.load(path.join(root, 'schemas'))
    const scanner = new CatalogScanner(
      root,
      new PluginStore(path.join(root, 'pages'), schemas),
      new JsonFileWriter(root, schemas),
      new GitHubMetadataProvider(new Octokit({ auth: process.env.GITHUB_TOKEN })),
    )
    const result = await scanner.scan(size)
    console.log(
      `Scanned ${result.plugins} plugins (${result.githubPlugins} on GitHub), wrote ${result.pages} pages, rendered ${result.readmePlugins} README entries.`,
    )
  })

export default program