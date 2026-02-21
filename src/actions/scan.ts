import path from 'node:path'

import { Octokit } from '@octokit/action'
import { Command } from 'commander'
import dayjs from 'dayjs'

const program = new Command('scan')

program.description('扫描以生成readme').action(async () => {
  const oct = new Octokit()
  const plugins = await Array.fromAsync(new Bun.Glob('./pages/*.json').scan({ cwd: '.' }))

  const readmeFile = Bun.file(path.join(import.meta.dirname, '../../README.md'))
  const content = await readmeFile.text()
  const signalWord = '<!-- Gen -->'
  const clearContent = content.slice(0, content.indexOf(signalWord))

  let newContent = clearContent

  newContent += signalWord
  newContent += '\n'

  for (const pluginPath of plugins) {
    const file = Bun.file(pluginPath)
    const name = path.parse(file.name ?? '_.json').name
    const meta = await file.stat()
    newContent += '\n'
    newContent += `## ${name}\n\n`
    newContent += `**加入注册时间:** ${dayjs(meta.ctimeMs).format('YYYY-MM-DD HH:mm')}\n\n`
    newContent += `**下载:**\n\n`
    newContent += `\`\`\`sh
ap:${name}
\`\`\`\n`
  }

  await readmeFile.write(newContent)
})

export default program