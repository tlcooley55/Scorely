const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { isUuid } = require('../lib/http')

const meTopSongsRouter = express.Router()
const profilesTopSongsRouter = express.Router()

function normalizeUuid(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return ''
  const m = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
  return (m ? m[0] : raw).trim()
}

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

    return art.replace(/\/100x100bb\./, '/512x512bb.')
  } catch (_) {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

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

    // Best-effort: backfill album_art for any songs missing it so the Top 5 UI can show thumbnails.
    if (Array.isArray(data) && data.length) {
      const missing = data
        .map((t) => t && t.songs)
        .filter((s) => s && !s.album_art && s.song_id && (s.title || s.artist))
        .slice(0, 5)

      await Promise.all(
        missing.map(async (s) => {
          const art = await lookupItunesAlbumArt({ title: s.title, artist: s.artist })
          if (!art) return

          await supabaseAdmin.from('songs').update({ album_art: art }).eq('song_id', s.song_id)
          s.album_art = art
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
    if (!normalizedSongId || !isUuid(normalizedSongId)) return res.status(422).json({ message: 'Validation failed' })

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
