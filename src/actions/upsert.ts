import path from 'node:path'

import { Command } from 'commander'

import { decodedUpsertIssue, type ArchivePlugin } from '../helper/issue'
import { closeIssue, getIssue, sendComment } from '../helper/repo'
const program = new Command('upsert')

program
  .description('添加或更新插件')
  .argument('<number>', 'issue的id')
  .action(async id => {
    const issue = (await getIssue(Number(id))).data

    console.log('发现issue', id)

    const plugin = decodedUpsertIssue(issue.body ?? '')

    console.log('解析完成', plugin)

    if (!plugin) {
      await closeIssue(issue, '不符合格式的内容')
      return
    }
    const file = Bun.file(path.join(process.cwd(), `pages/${plugin.id}.json`))

    console.log('文件:', file)

    if (await file.exists()) {
      const content: ArchivePlugin = await file.json()
      const isOwner = content.author.includes(issue.user?.name ?? '__')

      console.log('作者: ', content.author)

      if (!isOwner) {
        await closeIssue(issue, '不是该插件的作者之一, 无权修改')
        return
      }
    }

    console.log('鉴权完成')
    const withIssuer = plugin.authors.concat([issue.user?.name ?? 'github-actions']).filter(Boolean)

    await file.write(
      JSON.stringify(<ArchivePlugin>{
        author: withIssuer,
        download: plugin.download,
        id: plugin.id
      })
    )

    console.log('写入完成')
    await closeIssue(
      issue,
      `## 成功将您的插件加入注册表
      id: \`${plugin.id}\`
      download: \`ap:${plugin.id}\`
      author: ${withIssuer.map(v => `\n  - ${v}`).join()}
      `
    )
  })

export default program