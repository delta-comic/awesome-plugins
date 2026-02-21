import path from 'node:path'

import { Command } from 'commander'

import { decodedRemoveIssue, type ArchivePlugin } from '../helper/issue'
import { closeIssue, getIssue } from '../helper/repo'
const program = new Command('remove')

program
  .description('删除插件')
  .argument('<number>', 'issue的id')
  .action(async id => {
    const issue = (await getIssue(Number(id))).data

    console.log('发现issue', id)

    const plugin = decodedRemoveIssue(issue.body ?? '')

    console.log('解析完成', plugin)

    if (!plugin) {
      await closeIssue(issue, '**不符合格式的内容**')
      return
    }
    const file = Bun.file(path.join(process.cwd(), `pages/${plugin.id}.json`))

    console.log('文件:', file)

    if (!(await file.exists())) {
      await closeIssue(issue, `**不存在的插件 id:\`${plugin.id}\`**`)
      return
    }

    const content: ArchivePlugin = await file.json()
    const isOwner = content.author.includes(issue.user?.login ?? '__')

    console.log('作者: ', content.author)

    if (!isOwner) {
      await closeIssue(issue, '**您不是该插件的作者之一, 无权删除**')
      return
    }

    console.log('鉴权完成')

    await file.delete()

    console.log('删除完成')
    await closeIssue(
      issue,
      `## 成功将您的插件删除

- id: \`${plugin.id}\`
`
    )
  })

export default program