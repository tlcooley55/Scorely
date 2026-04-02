export default function FollowingFeedPage() {
  return (
    <section>
      <h2>Following Feed</h2>

      <h3>What this feature is</h3>
      <p>
        Shows rating activity from the users you follow (most recent updates first). Activity is derived
        from rating create/update events.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/activity">Back to Activity</a>
        </li>
        <li>
          <a href="/activity/history">My Listening History</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>View a feed of rating activity from users I follow.</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/activity</code>
        </li>
      </ul>
    </section>
  )
}
