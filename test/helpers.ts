import path from 'node:path'

import { SchemaRegistry } from '../src/infrastructure/schema'

export const projectRoot = path.join(import.meta.dirname, '..')

let schemas: Promise<SchemaRegistry> | undefined
export const loadSchemas = () =>
  (schemas ??= SchemaRegistry.load(path.join(projectRoot, 'schemas')))