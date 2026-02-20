import { Command } from 'commander'

import { decodedUpsertIssue, type ArchivePlugin } from '../helper/issue'
import { closeIssue, getIssue } from '../helper/repo'
const program = new Command('upsert')

program
  .description('添加或更新插件')
  .argument('<number>', 'issue的id')
  .action(async id => {
    const issue = (await getIssue(Number(id))).data
    const plugin = decodedUpsertIssue(issue.body ?? '')
    if (!plugin) {
      await closeIssue(issue, '不符合格式的内容')
      return
    }
    const file = Bun.file(`../../pages/${plugin.id}.json`)

    if (await file.exists()) {
      const content: ArchivePlugin = await file.json()
      const isOwner = content.author.includes(issue.user?.name ?? '__')
      if (!isOwner) {
        await closeIssue(issue, '不是该插件的作者之一, 无权修改')
        return
      }
    }

    await file.write(
      JSON.stringify(<ArchivePlugin>{
        author: plugin.authors.concat([issue.user?.name ?? '']).filter(Boolean),
        download: plugin.download,
        id: plugin.id
      })
    )
  })

export default program