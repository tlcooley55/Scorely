const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const { errorHandler, notFoundHandler } = require('./middleware/errors')
const { authRequiredUnless } = require('./middleware/auth')

const healthRoutes = require('./routes/health')
const { profilesRouter, meProfileRouter } = require('./routes/profiles')
const songsRoutes = require('./routes/songs')
const { ratingsRouter, meRatingsRouter } = require('./routes/ratings')
const bookmarksRoutes = require('./routes/bookmarks')
const friendsRoutes = require('./routes/friends')
const searchesRoutes = require('./routes/searches')
const activityRoutes = require('./routes/activity')
const { meTopSongsRouter, profilesTopSongsRouter } = require('./routes/top_songs')

function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan('dev'))

  // OpenAPI has global bearerAuth with explicit exception on /health.
  app.use(authRequiredUnless(['/v1/health']))

  app.use('/v1/health', healthRoutes)
  app.use('/v1/profiles', profilesRouter)
  app.use('/v1/me/profile', meProfileRouter)
  app.use('/v1/songs', songsRoutes)
  app.use('/v1/ratings', ratingsRouter)
  app.use('/v1/me/ratings', meRatingsRouter)
  app.use('/v1/bookmarks', bookmarksRoutes)
  app.use('/v1/friends', friendsRoutes)
  app.use('/v1/searches', searchesRoutes)
  app.use('/v1/activity', activityRoutes)
  app.use('/v1/me/top-songs', meTopSongsRouter)
  app.use('/v1/profiles', profilesTopSongsRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
