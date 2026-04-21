const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { parseIntParam, pagination, isUuid } = require('../lib/http')

const router = express.Router()

async function lookupItunesAlbumArt({ title, artist }) {
  const q = [title, artist].filter(Boolean).join(' ').trim()
  if (!q) return null

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=1`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2500)
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })

    if (!res.ok) return null
    const json = await res.json().catch(() => null)
    const item = json && Array.isArray(json.results) && json.results.length ? json.results[0] : null
    const art = item && typeof item.artworkUrl100 === 'string' ? item.artworkUrl100 : null
    if (!art) return null

    // Prefer a higher-res image when possible.
    return art.replace(/\/100x100bb\./, '/512x512bb.')
  } catch (_) {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { q, artist, genre, releaseYear } = req.query
    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    let query = supabaseAdmin
      .from('songs')
      .select('song_id, title, artist, album_art, genre, release_year, created_at', { count: 'exact' })

    if (artist) query = query.ilike('artist', `%${artist}%`)
    if (genre) query = query.ilike('genre', `%${genre}%`)

    if (releaseYear !== undefined) {
      const ry = Number(releaseYear)
      if (!Number.isNaN(ry)) query = query.eq('release_year', ry)
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,artist.ilike.%${q}%`)
    }

    const { data, error, count } = await query
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
    const { title, artist, album_art, genre, release_year } = req.body || {}

    if (!title || typeof title !== 'string' || !artist || typeof artist !== 'string') {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const resolvedAlbumArt =
      album_art && typeof album_art === 'string' && album_art.trim()
        ? album_art.trim()
        : await lookupItunesAlbumArt({ title, artist })

    const { data, error } = await supabaseAdmin
      .from('songs')
      .insert({ title, artist, album_art: resolvedAlbumArt, genre, release_year })
      .select('song_id, title, artist, album_art, genre, release_year, created_at')
      .single()

    if (error) return next(error)

    return res.status(201).json(data)
  } catch (err) {
    return next(err)
  }
})

router.get('/:songId', async (req, res, next) => {
  try {
    const { songId } = req.params
    if (!isUuid(songId)) return res.status(400).json({ message: 'Bad request' })

    const { data: song, error: sErr } = await supabaseAdmin
      .from('songs')
      .select('song_id, title, artist, album_art, genre, release_year, created_at')
      .eq('song_id', songId)
      .maybeSingle()

    if (sErr) return next(sErr)
    if (!song) return res.status(404).json({ message: 'Resource not found' })

    if (!song.album_art || (typeof song.album_art === 'string' && !song.album_art.trim())) {
      const resolvedAlbumArt = await lookupItunesAlbumArt({ title: song.title, artist: song.artist })
      if (resolvedAlbumArt) {
        const { data: updated, error: uErr } = await supabaseAdmin
          .from('songs')
          .update({ album_art: resolvedAlbumArt })
          .eq('song_id', songId)
          .select('song_id, title, artist, album_art, genre, release_year, created_at')
          .maybeSingle()

        if (uErr) return next(uErr)
        if (updated) song.album_art = updated.album_art
      }
    }

    const { data: ratings, error: rErr } = await supabaseAdmin
      .from('ratings')
      .select('rating_value')
      .eq('song_id', songId)

    if (rErr) return next(rErr)

    const ratingCount = ratings ? ratings.length : 0
    const aggregateRating = ratingCount
      ? ratings.reduce((sum, r) => sum + Number(r.rating_value || 0), 0) / ratingCount
      : null

    return res.status(200).json({
      ...song,
      aggregate_rating: aggregateRating,
      rating_count: ratingCount,
    })
  } catch (err) {
    return next(err)
  }
})

router.patch('/:songId', async (req, res, next) => {
  try {
    const { songId } = req.params
    if (!isUuid(songId)) return res.status(400).json({ message: 'Bad request' })

    const { title, artist, album_art, genre, release_year } = req.body || {}

    const { data, error } = await supabaseAdmin
      .from('songs')
      .update({ title, artist, album_art, genre, release_year })
      .eq('song_id', songId)
      .select('song_id, title, artist, album_art, genre, release_year, created_at')
      .maybeSingle()

    if (error) return next(error)
    if (!data) return res.status(404).json({ message: 'Resource not found' })

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

router.delete('/:songId', async (req, res, next) => {
  try {
    const { songId } = req.params
    if (!isUuid(songId)) return res.status(400).json({ message: 'Bad request' })

    const { error, count } = await supabaseAdmin
      .from('songs')
      .delete({ count: 'exact' })
      .eq('song_id', songId)

    if (error) return next(error)
    if ((count ?? 0) === 0) return res.status(404).json({ message: 'Resource not found' })

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

// OpenAPI: /songs/{songId}/ratings
router.get('/:songId/ratings', async (req, res, next) => {
  try {
    const { songId } = req.params
    if (!isUuid(songId)) return res.status(400).json({ message: 'Bad request' })

    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    const { data, error, count } = await supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id, song_id, rating_value, review, created_at', { count: 'exact' })
      .eq('song_id', songId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return next(error)

    return res.status(200).json({ data, pagination: pagination(limit, offset, count ?? 0) })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
