export default function SearchesPage() {
  return (
    <section>
      <h2>Search History</h2>

      <h3>What this feature is</h3>
      <p>
        Search History keeps a record of the song searches you’ve made, so you can quickly repeat a
        search later. Each entry stores the query text and when it was searched.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/songs">Search songs</a>
        </li>
        <li>
          <a href="/bookmarks">My Bookmarks</a>
        </li>
        <li>
          <a href="/activity">Activity</a>
        </li>
        <li>
          <a href="/profile">My Profile</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 2: Search for songs so I can find music to rate.</li>
        <li>Search feature: View Search History so I can repeat searches easily.</li>
      </ul>

      <h3>Rules / constraints</h3>
      <ul>
        <li>
          <strong>Query length:</strong> 1–255 characters
        </li>
        <li>
          <strong>Ownership:</strong> you can only view / delete your own search history
        </li>
      </ul>

      <h3>Primary UI pieces</h3>
      <ul>
        <li>
          <strong>Recent searches list</strong>
          <div>Ordered by newest first</div>
        </li>
        <li>
          <strong>Repeat search</strong>
          <div>Click an entry to populate the search input</div>
        </li>
        <li>
          <strong>Clear entry / clear all</strong>
          <div>Delete a single search (or all searches)</div>
        </li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/searches</code>
          <div>List my search history</div>
        </li>
        <li>
          <code>POST /v1/searches</code>
          <div>Log a search query (body: query)</div>
        </li>
        <li>
          <code>GET /v1/searches/:searchId</code>
          <div>Get one search entry by id (owner only)</div>
        </li>
        <li>
          <code>DELETE /v1/searches/:searchId</code>
          <div>Delete one search entry (owner only)</div>
        </li>
      </ul>

      <h3>Error cases</h3>
      <ul>
        <li>422 validation failed (query missing or too long)</li>
        <li>403 operation not allowed (trying to access someone else’s search)</li>
        <li>404 resource not found</li>
      </ul>
    </section>
  )
}
