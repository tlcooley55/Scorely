export default function HistoryFilterPage() {
  return (
    <section>
      <h2>Listening History Filter (4–5 Stars)</h2>

      <h3>What this feature is</h3>
      <p>Shows only ratings where stars are 4 or 5. This does not change stored data.</p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/activity/history">Back to History</a>
        </li>
        <li>
          <a href="/activity/feed">Following Feed</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 5: Filter my listening history by 4–5 star ratings.</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/me/ratings?minRating=4</code>
        </li>
      </ul>
    </section>
  )
}
