import { Command } from 'commander'

import { closeIssue, getAllOpenedIssue } from '../helper/repo'
const program = new Command('scan')

program
  .description('扫描issue')
  .action(async () => {
    const issues = await getAllOpenedIssue()
    await Promise.all( 
      issues.map(async issue => {
        const isUpsert = issue.labels.includes('UpsertPlugin')
        if (!issue.body) {
          await closeIssue(issue, '不符合格式的内容')
          return
        }
        if (isUpsert && issue.body) {
          console.log(issue.body)
        }
      })
    )
  })

export default program