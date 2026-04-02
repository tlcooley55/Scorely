const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { parseIntParam, pagination, isUuid } = require('../lib/http')

const router = express.Router()
const meProfileRouter = express.Router()

async function getMyProfile(req, res, next) {
  try {
    const userId = req.auth.userId

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id, username, created_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
}

async function patchMyProfile(req, res, next) {
  try {
    const userId = req.auth.userId
    const { username } = req.body || {}

    if (username !== undefined) {
      if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
        return res.status(422).json({ message: 'Validation failed' })
      }
    }

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (exErr) return next(exErr)

    // If the profile doesn't exist yet, require a username to create it.
    if (!existing && username === undefined) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const payload = { user_id: userId }
    if (username !== undefined) payload.username = username

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('user_id, username, created_at')
      .single()

    if (error) {
      if (String(error.code) === '23505') {
        return res.status(409).json({ message: 'Conflict with existing data or uniqueness constraint' })
      }
      return next(error)
    }

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
}

router.get('/', async (req, res, next) => {
  try {
    const username = req.query.username
    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    let query = supabaseAdmin
      .from('profiles')
      .select('user_id, username, created_at', { count: 'exact' })

    if (username) query = query.eq('username', username)

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return next(error)

    return res.status(200).json({
      data,
      pagination: pagination(limit, offset, count ?? 0),
    })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const { username } = req.body || {}

    if (!username || typeof username !== 'string' || username.length < 3 || username.length > 50) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({ user_id: userId, username })
      .select('user_id, username, created_at')
      .single()

    if (error) {
      if (String(error.code) === '23505') {
        return res.status(409).json({ message: 'Conflict with existing data or uniqueness constraint' })
      }
      return next(error)
    }

    return res.status(201).json(data)
  } catch (err) {
    return next(err)
  }
})

router.get('/me', async (req, res, next) => {
  return getMyProfile(req, res, next)
})

router.patch('/me', async (req, res, next) => {
  return patchMyProfile(req, res, next)
})

// OpenAPI: /me/profile
meProfileRouter.get('/', getMyProfile)
meProfileRouter.patch('/', patchMyProfile)

router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params
    if (!isUuid(userId)) return res.status(400).json({ message: 'Bad request' })

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id, username, created_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

router.delete('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params
    if (!isUuid(userId)) return res.status(400).json({ message: 'Bad request' })

    if (userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    const { error, count } = await supabaseAdmin
      .from('profiles')
      .delete({ count: 'exact' })
      .eq('user_id', userId)

    if (error) return next(error)
    if ((count ?? 0) === 0) return res.status(404).json({ message: 'Resource not found' })

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

// OpenAPI: /profiles/{userId}/followers
router.get('/:userId/followers', async (req, res, next) => {
  try {
    const { userId } = req.params
    if (!isUuid(userId)) return res.status(400).json({ message: 'Bad request' })

    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    const { data, error, count } = await supabaseAdmin
      .from('friends')
      .select('friend_id, user_id, friend_user_id, created_at', { count: 'exact' })
      .eq('friend_user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return next(error)

    return res.status(200).json({ data, pagination: pagination(limit, offset, count ?? 0) })
  } catch (err) {
    return next(err)
  }
})

module.exports = { profilesRouter: router, meProfileRouter }
