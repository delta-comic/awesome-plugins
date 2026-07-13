export type ReportKind = 'error' | 'forbidden' | 'info' | 'success'

const presentation: Record<ReportKind, { emoji: string; title: string }> = {
  error: { emoji: '❌', title: '请求未执行' },
  forbidden: { emoji: '🔒', title: '权限不足' },
  info: { emoji: 'ℹ️', title: '无需重复执行' },
  success: { emoji: '✅', title: '操作成功' },
}

export class OperationLog {
  readonly #entries: string[] = []

  info(message: string) {
    this.#entries.push(`[INFO] ${message}`)
  }

  error(message: string) {
    this.#entries.push(`[ERROR] ${message}`)
  }

  render() {
    return this.#entries.join('\n') || '[INFO] No additional log entries'
  }
}

export const renderReport = (
  kind: ReportKind,
  summary: string,
  log: OperationLog,
  bodyHash: string,
) => {
  const { emoji, title } = presentation[kind]
  return `## ${emoji} ${title}

${summary}

<details>
<summary>📋 执行日志</summary>

\`\`\`text
${log.render().replaceAll('```', "''' ")}
\`\`\`

</details>

<!-- registry-control:${bodyHash} -->`
}