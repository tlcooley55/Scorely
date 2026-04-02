const { supabaseAdmin } = require('../lib/supabase')

function getBearerToken(req) {
  const header = req.headers.authorization
  if (!header) return null
  const [type, token] = header.split(' ')
  if (!type || type.toLowerCase() !== 'bearer' || !token) return null
  return token
}

async function authRequired(req, res, next) {
  try {
    const token = getBearerToken(req)
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data || !data.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    req.auth = {
      userId: data.user.id,
      token,
    }

    return next()
  } catch (err) {
    return next(err)
  }
}

function authRequiredUnless(publicPaths) {
  const set = new Set(publicPaths)
  return function authUnless(req, res, next) {
    if (set.has(req.path)) return next()
    return authRequired(req, res, next)
  }
}

module.exports = {
  authRequired,
  authRequiredUnless,
}
