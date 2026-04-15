const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { isUuid } = require('../lib/http')

const meTopSongsRouter = express.Router()
const profilesTopSongsRouter = express.Router()

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
    if (!song_id || !isUuid(song_id)) return res.status(422).json({ message: 'Validation failed' })

    const { data, error } = await supabaseAdmin
      .from('top_songs')
      .upsert({ user_id: userId, position, song_id }, { onConflict: 'user_id,position' })
      .select('top_song_id, user_id, song_id, position, created_at')
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
    if ((count ?? 0) === 0) return res.status(404).json({ message: 'Resource not found' })

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
