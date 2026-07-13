import { describe, expect, test } from 'bun:test'

import { OperationLog, renderReport } from '../src/control/reporter'

describe('renderReport', () => {
  test('makes status visible and folds execution logs by default', () => {
    const log = new OperationLog()
    log.info('Parsed control request')
    const report = renderReport('success', 'Done.', log, 'abc123')
    expect(report).toStartWith('## ✅ 操作成功')
    expect(report).toContain('<details>')
    expect(report).toContain('<summary>📋 执行日志</summary>')
    expect(report).toContain('[INFO] Parsed control request')
    expect(report).toContain('<!-- registry-control:abc123 -->')
  })
})