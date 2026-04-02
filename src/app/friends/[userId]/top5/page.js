export default function FriendTop5Page({ params }) {
  const userId = params?.userId

  return (
    <section>
      <h2>Friend Top 5 Songs</h2>

      <h3>Route params</h3>
      <ul>
        <li>
          <strong>userId:</strong> <code>{String(userId)}</code>
        </li>
      </ul>

      <h3>What this feature is</h3>
      <p>
        Shows a friend’s top 5 songs based on highest rating, breaking ties by most recently updated.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href={`/friends/${String(userId)}`}>Back to Friend Profile</a>
        </li>
        <li>
          <a href="/friends">Back to Friends</a>
        </li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/profiles/:userId</code>
        </li>
        <li>
          <code>GET /v1/ratings?userId=:userId</code>
        </li>
      </ul>

      <h3>Notes</h3>
      <ul>
        <li>Top 5 is computed (not stored) from ratings data.</li>
      </ul>
    </section>
  )
}
