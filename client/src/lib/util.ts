export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function toIsoString(value: Date | string | number): string {
  const d = value instanceof Date ? value : new Date(value)
  return d.toISOString()
}
