function parseIntParam(value, { min, max, def } = {}) {
  if (value === undefined || value === null || value === '') return def
  const n = Number(value)
  if (!Number.isInteger(n)) return def
  if (min !== undefined && n < min) return def
  if (max !== undefined && n > max) return def
  return n
}

function pagination(limit, offset, count) {
  return { limit, offset, count }
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

module.exports = {
  parseIntParam,
  pagination,
  isUuid,
}
