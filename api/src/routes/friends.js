const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { parseIntParam, pagination, isUuid } = require('../lib/http')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    const { data, error, count } = await supabaseAdmin
      .from('friends')
      .select('friend_id, user_id, friend_user_id, created_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return next(error)

    return res.status(200).json({ data, pagination: pagination(limit, offset, count ?? 0) })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const { friend_user_id } = req.body || {}

    if (!friend_user_id || !isUuid(friend_user_id)) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    if (friend_user_id === userId) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { data, error } = await supabaseAdmin
      .from('friends')
      .insert({ user_id: userId, friend_user_id })
      .select('friend_id, user_id, friend_user_id, created_at')
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

router.get('/:friendId', async (req, res, next) => {
  try {
    const { friendId } = req.params
    if (!isUuid(friendId)) return res.status(400).json({ message: 'Bad request' })

    const { data, error } = await supabaseAdmin
      .from('friends')
      .select('friend_id, user_id, friend_user_id, created_at')
      .eq('friend_id', friendId)
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

router.delete('/:friendId', async (req, res, next) => {
  try {
    const { friendId } = req.params
    if (!isUuid(friendId)) return res.status(400).json({ message: 'Bad request' })

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('friends')
      .select('friend_id, user_id')
      .eq('friend_id', friendId)
      .maybeSingle()

    if (exErr) return next(exErr)
    if (!existing) return res.status(404).json({ message: 'Resource not found' })

    if (existing.user_id !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    const { error } = await supabaseAdmin.from('friends').delete().eq('friend_id', friendId)
    if (error) return next(error)

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

module.exports = router
