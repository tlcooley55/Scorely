export default function FriendProfilePage({ params }) {
  const userId = params?.userId

  return (
    <section>
      <h2>Friend Profile</h2>

      <h3>Route params</h3>
      <ul>
        <li>
          <strong>userId:</strong> <code>{String(userId)}</code>
        </li>
      </ul>

      <h3>What this feature is</h3>
      <p>
        View another user’s profile, their recent ratings, and follow/unfollow them to customize your
        feed.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/friends">Back to Friends</a>
        </li>
        <li>
          <a href={`/friends/${String(userId)}/top5`}>Top 5 Songs</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 7: View a friend’s profile to see their ratings.</li>
        <li>User Story 8: See a friend’s top five songs to discover music.</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/profiles/:userId</code>
        </li>
        <li>
          <code>GET /v1/ratings?userId=:userId</code> (recent ratings)
        </li>
        <li>
          <code>POST /v1/friends/:userId</code> (follow)
        </li>
        <li>
          <code>DELETE /v1/friends/:userId</code> (unfollow)
        </li>
      </ul>
    </section>
  )
}
