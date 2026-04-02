const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { parseIntParam, pagination, isUuid } = require('../lib/http')

const ratingsRouter = express.Router()
const meRatingsRouter = express.Router()

ratingsRouter.get('/', async (req, res, next) => {
  try {
    const { userId, songId, minRating, maxRating } = req.query
    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    let query = supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id, song_id, rating_value, review, created_at', { count: 'exact' })

    if (userId) query = query.eq('user_id', userId)
    if (songId) query = query.eq('song_id', songId)
    if (minRating !== undefined) query = query.gte('rating_value', Number(minRating))
    if (maxRating !== undefined) query = query.lte('rating_value', Number(maxRating))

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return next(error)

    return res.status(200).json({ data, pagination: pagination(limit, offset, count ?? 0) })
  } catch (err) {
    return next(err)
  }
})

ratingsRouter.post('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const { song_id, rating_value, review } = req.body || {}

    if (!song_id || !isUuid(song_id)) return res.status(422).json({ message: 'Validation failed' })

    const rv = Number(rating_value)
    if (!Number.isInteger(rv) || rv < 1 || rv > 5) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .insert({ user_id: userId, song_id, rating_value: rv, review })
      .select('rating_id, user_id, song_id, rating_value, review, created_at')
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

ratingsRouter.get('/:ratingId', async (req, res, next) => {
  try {
    const { ratingId } = req.params
    if (!isUuid(ratingId)) return res.status(400).json({ message: 'Bad request' })

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id, song_id, rating_value, review, created_at')
      .eq('rating_id', ratingId)
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

ratingsRouter.patch('/:ratingId', async (req, res, next) => {
  try {
    const { ratingId } = req.params
    if (!isUuid(ratingId)) return res.status(400).json({ message: 'Bad request' })

    const { rating_value, review } = req.body || {}

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id')
      .eq('rating_id', ratingId)
      .maybeSingle()

    if (exErr) return next(exErr)
    if (!existing) return res.status(404).json({ message: 'Resource not found' })

    if (existing.user_id !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    const update = {}

    if (rating_value !== undefined) {
      const rv = Number(rating_value)
      if (!Number.isInteger(rv) || rv < 1 || rv > 5) {
        return res.status(422).json({ message: 'Validation failed' })
      }
      update.rating_value = rv
    }

    if (review !== undefined) update.review = review

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .update(update)
      .eq('rating_id', ratingId)
      .select('rating_id, user_id, song_id, rating_value, review, created_at')
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

ratingsRouter.delete('/:ratingId', async (req, res, next) => {
  try {
    const { ratingId } = req.params
    if (!isUuid(ratingId)) return res.status(400).json({ message: 'Bad request' })

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id')
      .eq('rating_id', ratingId)
      .maybeSingle()

    if (exErr) return next(exErr)
    if (!existing) return res.status(404).json({ message: 'Resource not found' })

    if (existing.user_id !== req.auth.userId) {
      return res.status(403).json({ message: 'Operation not allowed' })
    }

    const { error } = await supabaseAdmin.from('ratings').delete().eq('rating_id', ratingId)
    if (error) return next(error)

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

// OpenAPI: /me/ratings
meRatingsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.auth.userId

    const minRating = req.query.minRating
    const sort = req.query.sort || 'created_at'
    const order = req.query.order || 'desc'
    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    let query = supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id, song_id, rating_value, review, created_at', { count: 'exact' })
      .eq('user_id', userId)

    if (minRating !== undefined) query = query.gte('rating_value', Number(minRating))

    const sortCol = sort === 'rating_value' ? 'rating_value' : 'created_at'
    const asc = String(order).toLowerCase() === 'asc'

    const { data, error, count } = await query
      .order(sortCol, { ascending: asc })
      .range(offset, offset + limit - 1)

    if (error) return next(error)

    return res.status(200).json({ data, pagination: pagination(limit, offset, count ?? 0) })
  } catch (err) {
    return next(err)
  }
})

module.exports = { ratingsRouter, meRatingsRouter }
