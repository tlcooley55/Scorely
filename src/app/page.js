import { apiFetch, getApiBase } from '../../client/src/lib/api'
import { supabaseUrl } from '../../client/src/lib/supabase'
import { toIsoString } from '../../client/src/lib/util'

export default async function HomePage() {
  let health
  let healthError

  try {
    health = await apiFetch('/health')
  } catch (err) {
    healthError = err instanceof Error ? err.message : String(err)
  }

  return (
    <section>
      <h2>Welcome to Scorely</h2>
      <p>
        Scorely is a social music rating app where you can rate songs (1–5 stars), write short reviews,
        and see what your friends are listening to.
      </p>

      <h3>System status</h3>
      <ul>
        <li>
          <strong>API base:</strong> <code>{getApiBase()}</code>
        </li>
        <li>
          <strong>Supabase URL:</strong> <code>{supabaseUrl ?? '(not set)'}</code>
        </li>
        <li>
          <strong>Checked at:</strong> <code>{toIsoString(new Date())}</code>
        </li>
        <li>
          <strong>API health:</strong>{' '}
          {healthError ? <code>{healthError}</code> : <code>{JSON.stringify(health)}</code>}
        </li>
      </ul>

      <h3>Quick start</h3>
      <ol>
        <li>
          <strong>Sign in</strong>
          <div>
            Go to <a href="/login">Login</a>.
          </div>
        </li>
        <li>
          <strong>Find a song</strong>
          <div>
            Use <a href="/songs">Songs</a> to search or create a song.
          </div>
        </li>
        <li>
          <strong>Rate it</strong>
          <div>
            Open a song detail page (example: <a href="/songs/example-song-id">Song Detail</a>) and
            add your rating and review.
          </div>
        </li>
        <li>
          <strong>See your history</strong>
          <div>
            Visit <a href="/activity/history">My Listening History</a>.
          </div>
        </li>
        <li>
          <strong>Follow friends</strong>
          <div>
            Browse <a href="/friends">Friends</a> and check the <a href="/activity/feed">Following Feed</a>.
          </div>
        </li>
      </ol>

      <h3>Explore</h3>
      <ul>
        <li>
          <a href="/profile">My Profile</a>
        </li>
        <li>
          <a href="/songs">Songs</a>
        </li>
        <li>
          <a href="/activity">Activity</a>
        </li>
        <li>
          <a href="/friends">Friends</a>
        </li>
      </ul>

      <h3>Notes</h3>
      <ul>
        <li>Scorely does not stream music; it’s a rating journal + social feed.</li>
        <li>One rating per user per song (updates overwrite your previous rating).</li>
      </ul>
    </section>
  )
}
