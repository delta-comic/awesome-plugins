import { parse } from 'yaml'

import type { ControlRequest } from '../domain/plugin'
import type { SchemaRegistry } from '../infrastructure/schema'

export class MarkdownControlParser {
  constructor(private readonly schemas: SchemaRegistry) {}

  parse(body: string): ControlRequest {
    const pattern = /<!--\s*plugin-control\s*-->\s*```ya?ml\s*\n([\s\S]*?)\n```/gi
    const blocks = Array.from(body.matchAll(pattern))
    if (blocks.length !== 1) {
      throw new SyntaxError('Issue must contain exactly one marked plugin-control YAML block')
    }

    const source = blocks[0]?.[1]
    const value: unknown = parse(source ?? '')
    this.schemas.assert<ControlRequest>('control-request', value)
    return value
  }
}