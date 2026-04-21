function notFoundHandler(req, res) {
  return res.status(404).json({ message: 'Resource not found' })
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err)

  if (res.headersSent) return

  const status =
    (err && (err.statusCode || err.status) && Number.isInteger(Number(err.statusCode || err.status))
      ? Number(err.statusCode || err.status)
      : 500)

  const msg = err && typeof err.message === 'string' && err.message.trim() ? err.message : 'Internal server error'

  return res.status(status).json({ message: msg })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
