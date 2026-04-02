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
      .from('searches')
      .select('search_id, user_id, query, searched_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
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
    const { query } = req.body || {}

    if (!query || typeof query !== 'string' || query.length < 1 || query.length > 255) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { data, error } = await supabaseAdmin
      .from('searches')
      .insert({ user_id: userId, query })
      .select('search_id, user_id, query, searched_at')
      .single()

    if (error) return next(error)

    return res.status(201).json(data)
  } catch (err) {
    return next(err)
  }
})

router.get('/:searchId', async (req, res, next) => {
  try {
    const { searchId } = req.params
    if (!isUuid(searchId)) return res.status(400).json({ message: 'Bad request' })

    const { data, error } = await supabaseAdmin
      .from('searches')
      .select('search_id, user_id, query, searched_at')
      .eq('search_id', searchId)
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    if (data.user_id !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

router.delete('/:searchId', async (req, res, next) => {
  try {
    const { searchId } = req.params
    if (!isUuid(searchId)) return res.status(400).json({ message: 'Bad request' })

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('searches')
      .select('search_id, user_id')
      .eq('search_id', searchId)
      .maybeSingle()

    if (exErr) return next(exErr)
    if (!existing) return res.status(404).json({ message: 'Resource not found' })

    if (existing.user_id !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    const { error } = await supabaseAdmin.from('searches').delete().eq('search_id', searchId)
    if (error) return next(error)

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

module.exports = router
