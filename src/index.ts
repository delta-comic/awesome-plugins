import { program, type Command } from 'commander'

const actions = await Promise.all(
  (await Array.fromAsync(new Bun.Glob('./actions/*.ts').scan({ cwd: './src' }))).map(v =>
    import(v).then<Command>(v => v.default)
  )
)

program.name('pm').alias('plugin-manger').description('插件管理办法').version('1.0.0')

for (const cmd of actions) {
  program.addCommand(cmd)
}

program.parse()