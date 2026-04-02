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
      .from('bookmarks')
      .select('bookmark_id, user_id, song_id, created_at', { count: 'exact' })
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
    const { song_id } = req.body || {}

    if (!song_id || !isUuid(song_id)) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .insert({ user_id: userId, song_id })
      .select('bookmark_id, user_id, song_id, created_at')
      .single()

    if (error) return next(error)

    return res.status(201).json(data)
  } catch (err) {
    return next(err)
  }
})

router.get('/:bookmarkId', async (req, res, next) => {
  try {
    const { bookmarkId } = req.params
    if (!isUuid(bookmarkId)) return res.status(400).json({ message: 'Bad request' })

    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .select('bookmark_id, user_id, song_id, created_at')
      .eq('bookmark_id', bookmarkId)
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

router.delete('/:bookmarkId', async (req, res, next) => {
  try {
    const { bookmarkId } = req.params
    if (!isUuid(bookmarkId)) return res.status(400).json({ message: 'Bad request' })

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('bookmarks')
      .select('bookmark_id, user_id')
      .eq('bookmark_id', bookmarkId)
      .maybeSingle()

    if (exErr) return next(exErr)
    if (!existing) return res.status(404).json({ message: 'Resource not found' })

    if (existing.user_id !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    const { error } = await supabaseAdmin.from('bookmarks').delete().eq('bookmark_id', bookmarkId)
    if (error) return next(error)

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

module.exports = router
