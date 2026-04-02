export default function RatingsPage() {
  return (
    <section>
      <h2>Ratings &amp; Reviews</h2>

      <h3>What this feature is</h3>
      <p>
        Ratings are the core of Scorely. Users rate songs from 1–5 stars and can optionally write a short
        review. Each user can have only one rating per song; editing overwrites the previous rating.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/songs">Find a song</a>
        </li>
        <li>
          <a href="/songs/example-song-id">Example Song Detail</a>
        </li>
        <li>
          <a href="/activity/history">My Listening History</a>
        </li>
        <li>
          <a href="/activity/history/filter">Filter: 4–5 Stars</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 3: Rate a song so I can record my opinion.</li>
        <li>User Story 4: Write a short review so I can express my thoughts.</li>
        <li>User Story 5: Edit my rating so I can update my opinion over time.</li>
        <li>User Story 6: View my rating history so I can see what I’ve rated.</li>
      </ul>

      <h3>Rules / constraints</h3>
      <ul>
        <li>
          <strong>Rating scale:</strong> integer 1–5
        </li>
        <li>
          <strong>One rating per song:</strong> unique (user_id, song_id)
        </li>
        <li>
          <strong>Review:</strong> optional, max 500 characters
        </li>
        <li>
          <strong>Edits:</strong> updates overwrite previous rating/review
        </li>
      </ul>

      <h3>Primary UI pieces</h3>
      <ul>
        <li>
          <strong>Star selector</strong>
          <div>Choose 1–5 stars</div>
        </li>
        <li>
          <strong>Review textbox</strong>
          <div>Optional, up to 500 characters</div>
        </li>
        <li>
          <strong>Save / update action</strong>
          <div>Create if missing, update if existing</div>
        </li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>POST /v1/ratings</code>
          <div>Create a rating for a song</div>
        </li>
        <li>
          <code>PATCH /v1/ratings/:ratingId</code>
          <div>Update an existing rating (owned by the current user)</div>
        </li>
        <li>
          <code>GET /v1/me/ratings</code>
          <div>My rating history (supports minRating filter)</div>
        </li>
        <li>
          <code>GET /v1/ratings?userId=:userId&amp;songId=:songId</code>
          <div>Lookup ratings (admin-style list/search)</div>
        </li>
      </ul>

      <h3>Error cases</h3>
      <ul>
        <li>422 validation failed (bad song_id UUID, rating not 1–5)</li>
        <li>403 operation not allowed (editing someone else’s rating)</li>
        <li>409 conflict (duplicate rating row if uniqueness is violated)</li>
      </ul>
    </section>
  )
}
