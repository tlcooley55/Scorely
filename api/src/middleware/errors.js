function notFoundHandler(req, res) {
  return res.status(404).json({ message: 'Resource not found' })
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err)

  if (res.headersSent) return

  return res.status(500).json({ message: 'Internal server error' })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
