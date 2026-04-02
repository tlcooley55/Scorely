export default function SongsPage() {
  return (
    <section>
      <h2>Songs</h2>

      <h3>What this feature is</h3>
      <p>Search for songs in the app database, view details, and create a song if it does not exist.</p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/songs/new">Create Song</a>
        </li>
        <li>
          <a href="/songs/example-song-id">Example Song Detail</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 2: Search for songs to find music to rate.</li>
      </ul>

      <h3>Primary screens</h3>
      <ul>
        <li>Song search</li>
        <li>Song detail</li>
        <li>Create song</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/songs</code> (list / search)
        </li>
        <li>
          <code>POST /v1/songs</code> (create)
        </li>
        <li>
          <code>GET /v1/songs/:songId</code> (detail)
        </li>
      </ul>
    </section>
  )
}
