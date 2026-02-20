import { Command } from 'commander'
const program = new Command()

program
  .command('upsert')
  .description('添加或更新插件')
  .argument('<string>', '插件的id')
  .argument('<download>', '下载方法')
  .argument('<version>', '插件的版本')
  .option('-a', '--author', '该issue的发起者')

export default program