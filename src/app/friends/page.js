export default function FriendsPage() {
  return (
    <section>
      <h2>Friends</h2>

      <h3>What this feature is</h3>
      <p>Follow other users to see their ratings and discover music through social connections.</p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/friends/example-user-id">Example Friend Profile</a>
        </li>
        <li>
          <a href="/friends/example-user-id/top5">Example Friend Top 5</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 7: View a friend’s profile to see their ratings.</li>
        <li>User Story 8: See a friend’s top five songs to discover music.</li>
      </ul>

      <h3>Primary screens</h3>
      <ul>
        <li>Find users / browse users</li>
        <li>Friend profile</li>
        <li>Follow / Unfollow</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/profiles</code> (search/browse users)
        </li>
        <li>
          <code>GET /v1/profiles/:userId</code> (view user)
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
