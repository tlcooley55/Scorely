export default function SongDetailPage({ params }) {
  const songId = params?.songId

  return (
    <section>
      <h2>Song Detail</h2>

      <h3>Route params</h3>
      <ul>
        <li>
          <strong>songId:</strong> <code>{String(songId)}</code>
        </li>
      </ul>

      <h3>What this feature is</h3>
      <p>
        The Song Detail page shows a specific song (title + artist) and the current user’s rating
        state for that song. From here the user can create or update a rating and optional review.
      </p>

      <h3>User stories</h3>
      <ul>
        <li>User Story 2: Search for songs so I can find music to rate.</li>
        <li>User Story 3: Rate songs from 1–5 stars.</li>
        <li>User Story 4: Write reviews about songs.</li>
      </ul>

      <h3>Primary UI sections</h3>
      <ul>
        <li>
          <strong>Song metadata</strong>
          <div>Title, artist (album/year optional)</div>
        </li>
        <li>
          <strong>My rating</strong>
          <div>Stars 1–5, review text (optional), save/update button</div>
        </li>
        <li>
          <strong>Community info (optional)</strong>
          <div>Aggregate rating or recent activity</div>
        </li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/songs/:songId</code> (load song)
        </li>
        <li>
          <code>GET /v1/me/ratings</code> (find my existing rating for this song)
        </li>
        <li>
          <code>POST /v1/ratings</code> (create rating)
        </li>
        <li>
          <code>PATCH /v1/ratings/:ratingId</code> (update rating)
        </li>
      </ul>

      <h3>Edge cases</h3>
      <ul>
        <li>Song not found (404)</li>
        <li>Invalid songId format</li>
        <li>User not authenticated</li>
        <li>One rating per user per song (update instead of duplicate)</li>
      </ul>
    </section>
  )
}
