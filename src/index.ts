import { program } from 'commander'

import upsert from './actions/upsert.ts'

program.name('plugin-manger').description('插件管理办法').version('1.0.0')

program.addCommand(upsert)

program.parse()