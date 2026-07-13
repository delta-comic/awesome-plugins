import path from 'node:path'

import addFormats from 'ajv-formats'
import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020'

export type SchemaName =
  | 'control-request'
  | 'plugin-listing'
  | 'plugin-registration'
  | 'registry-index'
  | 'registry-page'

export class SchemaValidationError extends TypeError {
  constructor(
    readonly schema: SchemaName,
    readonly errors: ErrorObject[] = [],
  ) {
    super(
      `Data does not match ${schema}: ${errors
        .map(error => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
        .join('; ')}`,
    )
    this.name = 'SchemaValidationError'
  }
}

export class SchemaRegistry {
  readonly #validators = new Map<SchemaName, ValidateFunction>()

  private constructor() {}

  static async load(schemaDirectory: string) {
    const registry = new SchemaRegistry()
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    addFormats(ajv)

    const names: SchemaName[] = [
      'control-request',
      'plugin-registration',
      'plugin-listing',
      'registry-index',
      'registry-page',
    ]
    const schemas = await Promise.all(
      names.map(name => Bun.file(path.join(schemaDirectory, `${name}.schema.json`)).json()),
    )

    for (const schema of schemas) ajv.addSchema(schema)
    for (const name of names) {
      const validator = ajv.getSchema(
        `https://delta-comic.github.io/awesome-plugins/schemas/${name}.schema.json`,
      )
      if (!validator) throw new Error(`Schema was not registered: ${name}`)
      registry.#validators.set(name, validator)
    }

    return registry
  }

  assert<T>(schema: SchemaName, value: unknown): asserts value is T {
    const validator = this.#validators.get(schema)
    if (!validator) throw new Error(`Unknown schema: ${schema}`)
    if (!validator(value)) throw new SchemaValidationError(schema, validator.errors ?? [])
  }
}