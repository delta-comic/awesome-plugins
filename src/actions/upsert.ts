import { Command } from 'commander'

import { decodedUpsertIssue } from '../helper/issue'
import { getIssue } from '../helper/repo'
const program = new Command('upsert')

program
  .description('添加或更新插件')
  .argument('<number>', 'issue的id')
  .action(async id => {
    const issue = (await getIssue(Number(id))).data
    decodedUpsertIssue(issue.body ?? '')
  })

export default program