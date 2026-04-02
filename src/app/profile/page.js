export default function ProfilePage() {
  return (
    <section>
      <h2>My Profile</h2>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/activity/history">My Listening History</a>
        </li>
        <li>
          <a href="/activity/feed">Following Feed</a>
        </li>
        <li>
          <a href="/friends">Find Friends</a>
        </li>
        <li>
          <a href="/songs">Browse Songs</a>
        </li>
      </ul>

      <h3>Profile information</h3>
      <p>This page contains the complete set of profile information the app will display.</p>

      <h4>Identity</h4>
      <ul>
        <li>
          <strong>Username:</strong> (from profiles)
        </li>
        <li>
          <strong>Display name:</strong> (optional)
        </li>
        <li>
          <strong>Avatar:</strong> (optional)
        </li>
        <li>
          <strong>Member since:</strong> (created_at)
        </li>
      </ul>

      <h4>Editable fields</h4>
      <ul>
        <li>Username (unique)</li>
        <li>Display name (optional)</li>
        <li>Avatar URL (optional)</li>
      </ul>

      <h4>Stats / summary</h4>
      <ul>
        <li>
          <strong>Total ratings:</strong> (count)
        </li>
        <li>
          <strong>Average rating:</strong> (optional)
        </li>
        <li>
          <strong>Bookmarks:</strong> (count)
        </li>
        <li>
          <strong>Following:</strong> (count)
        </li>
        <li>
          <strong>Followers:</strong> (optional)
        </li>
      </ul>

      <h4>Recent ratings</h4>
      <p>
        Shows your most recent rating updates. Each entry will include song, stars, and an optional review
        snippet.
      </p>
      <ul>
        <li>
          <a href="/activity/history">Go to full listening history</a>
        </li>
      </ul>

      <h4>Top 5 songs</h4>
      <p>
        Computed from your ratings: highest rating first, ties broken by most recently updated.
      </p>

      <h4>Bookmarks</h4>
      <p>Shows songs you bookmarked to revisit later.</p>

      <h4>Friends / following</h4>
      <p>Shows who you follow and (optionally) who follows you.</p>

      <h3>What this feature is</h3>
      <p>View and update your profile, including your username, and see your own ratings summary.</p>

      <h3>User stories</h3>
      <ul>
        <li>Profile is required to support rating and following features.</li>
      </ul>

      <h3>Primary screens</h3>
      <ul>
        <li>My profile details</li>
        <li>My recent ratings</li>
        <li>Top 5 songs (optional per task list)</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/me/profile</code>
        </li>
        <li>
          <code>PATCH /v1/me/profile</code>
        </li>
        <li>
          <code>GET /v1/me/ratings</code>
        </li>
        <li>
          <code>GET /v1/bookmarks</code>
        </li>
        <li>
          <code>GET /v1/friends</code>
        </li>
      </ul>
    </section>
  )
}
