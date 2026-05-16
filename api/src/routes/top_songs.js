const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { isUuid } = require('../lib/http')

const meTopSongsRouter = express.Router()
const profilesTopSongsRouter = express.Router()

function normalizeUuid(input) {
  const raw = String(input ?? '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .trim()
  if (!raw) return ''

  const m = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
  if (m) return m[0]

  const hex = raw.replace(/[^0-9a-f]/gi, '')
  if (hex.length === 32) {
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  return raw
}

const { lookupItunesSong } = require('./songs')

async function listTopSongsForUser(userId, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('top_songs')
      .select(
        'top_song_id, user_id, song_id, position, created_at, songs:song_id (song_id, title, artist, album_art, genre, release_year, created_at)'
      )
      .eq('user_id', userId)
      .order('position', { ascending: true })

    if (error) return next(error)

    // Best-effort: backfill missing album_art and release_year so the Top 5 UI can show full details.
    if (Array.isArray(data) && data.length) {
      const missing = data
        .map((t) => t && t.songs)
        .filter((s) => s && s.song_id && (s.title || s.artist) && (!s.album_art || !s.release_year))
        .slice(0, 5)

      await Promise.all(
        missing.map(async (s) => {
          const { albumArt, releaseYear } = await lookupItunesSong({ title: s.title, artist: s.artist })
          const patch = {}
          if (!s.album_art && albumArt) patch.album_art = albumArt
          if (!s.release_year && releaseYear) patch.release_year = releaseYear
          if (!Object.keys(patch).length) return

          await supabaseAdmin.from('songs').update(patch).eq('song_id', s.song_id)
          if (patch.album_art) s.album_art = patch.album_art
          if (patch.release_year) s.release_year = patch.release_year
        })
      )
    }

    return res.status(200).json({ data })
  } catch (err) {
    return next(err)
  }
}

// GET /v1/me/top-songs
meTopSongsRouter.get('/', async (req, res, next) => {
  const userId = req.auth.userId
  return listTopSongsForUser(userId, res, next)
})

// PUT /v1/me/top-songs/:position
// body: { song_id }
meTopSongsRouter.put('/:position', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const position = Number(req.params.position)

    if (!Number.isInteger(position) || position < 1 || position > 5) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { song_id } = req.body || {}
    const normalizedSongId = normalizeUuid(song_id)
    const hex = String(normalizedSongId).replace(/-/g, '')
    const isHexUuid = /^[0-9a-f]{32}$/i.test(hex)
    if (!normalizedSongId || !isHexUuid) {
      return res.status(422).json({
        message: 'Validation failed',
        details: {
          field: 'song_id',
          received: typeof song_id === 'string' ? song_id : JSON.stringify(song_id),
          normalized: normalizedSongId,
        },
      })
    }

    const { data, error } = await supabaseAdmin
      .from('top_songs')
      .upsert({ user_id: userId, position, song_id: normalizedSongId }, { onConflict: 'user_id,position' })
      .select('top_song_id, user_id, song_id, position, created_at')
      .single()

    if (error) {
      if (String(error.code) === '23505') {
        return res.status(409).json({
          message: 'Conflict with existing data or uniqueness constraint',
          details: error.message,
        })
      }
      return next(error)
    }

    return res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
})

// DELETE /v1/me/top-songs/:position
meTopSongsRouter.delete('/:position', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const position = Number(req.params.position)

    if (!Number.isInteger(position) || position < 1 || position > 5) {
      return res.status(422).json({ message: 'Validation failed' })
    }

    const { error, count } = await supabaseAdmin
      .from('top_songs')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('position', position)

    if (error) return next(error)
    // Idempotent: clearing an already-empty slot should still succeed.
    if ((count ?? 0) === 0) return res.status(204).send()

    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
})

// GET /v1/profiles/:userId/top-songs
profilesTopSongsRouter.get('/:userId/top-songs', async (req, res, next) => {
  const userId = req.params.userId
  if (!isUuid(userId)) return res.status(400).json({ message: 'Bad request' })
  return listTopSongsForUser(userId, res, next)
})

module.exports = { meTopSongsRouter, profilesTopSongsRouter }
