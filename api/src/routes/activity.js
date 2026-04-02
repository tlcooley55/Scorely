const express = require('express')

const { supabaseAdmin } = require('../lib/supabase')
const { parseIntParam, pagination } = require('../lib/http')

const router = express.Router()

// OpenAPI: /activity/feed
router.get('/feed', async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const limit = parseIntParam(req.query.limit, { min: 1, max: 100, def: 20 })
    const offset = parseIntParam(req.query.offset, { min: 0, def: 0 })

    const { data: follows, error: fErr } = await supabaseAdmin
      .from('friends')
      .select('friend_user_id')
      .eq('user_id', userId)

    if (fErr) return next(fErr)

    const followedIds = (follows || []).map((f) => f.friend_user_id)
    if (followedIds.length === 0) {
      return res.status(200).json({ data: [], pagination: pagination(limit, offset, 0) })
    }

    const { data: ratings, error: rErr, count } = await supabaseAdmin
      .from('ratings')
      .select('rating_id, user_id, song_id, rating_value, review, created_at', { count: 'exact' })
      .in('user_id', followedIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (rErr) return next(rErr)

    const userIds = Array.from(new Set((ratings || []).map((r) => r.user_id)))
    const songIds = Array.from(new Set((ratings || []).map((r) => r.song_id)))

    const [{ data: profiles, error: pErr }, { data: songs, error: sErr }] = await Promise.all([
      supabaseAdmin.from('profiles').select('user_id, username').in('user_id', userIds),
      supabaseAdmin.from('songs').select('song_id, title, artist').in('song_id', songIds),
    ])

    if (pErr) return next(pErr)
    if (sErr) return next(sErr)

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.username]))
    const songMap = new Map((songs || []).map((s) => [s.song_id, s]))

    const data = (ratings || []).map((r) => {
      const song = songMap.get(r.song_id)
      return {
        rating_id: r.rating_id,
        user_id: r.user_id,
        username: profileMap.get(r.user_id) || '',
        song_id: r.song_id,
        song_title: song ? song.title : '',
        artist: song ? song.artist : '',
        rating_value: r.rating_value,
        review: r.review,
        created_at: r.created_at,
      }
    })

    return res.status(200).json({ data, pagination: pagination(limit, offset, count ?? 0) })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
