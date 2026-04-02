export default function ActivityPage() {
  return (
    <section>
      <h2>Activity</h2>

      <h3>What this feature is</h3>
      <p>
        View rating activity over time. This includes your personal listening history and a feed of rating
        activity from people you follow.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/activity/feed">Following Feed</a>
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
        <li>User Story 6: View my listening history.</li>
        <li>User Story 5: Filter listening history by 4–5 stars.</li>
      </ul>

      <h3>Primary screens</h3>
      <ul>
        <li>My listening history</li>
        <li>Following feed</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/me/ratings</code> (my history)
        </li>
        <li>
          <code>GET /v1/activity</code> (following feed)
        </li>
      </ul>
    </section>
  )
}
