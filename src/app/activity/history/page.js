export default function ListeningHistoryPage() {
  return (
    <section>
      <h2>My Listening History</h2>

      <h3>What this feature is</h3>
      <p>Shows all of your ratings ordered by most recently updated.</p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/activity">Back to Activity</a>
        </li>
        <li>
          <a href="/activity/history/filter">Filter: 4–5 Stars</a>
        </li>
        <li>
          <a href="/activity/feed">Following Feed</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 6: View my listening history.</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/me/ratings</code>
        </li>
      </ul>
    </section>
  )
}
