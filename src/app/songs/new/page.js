export default function CreateSongPage() {
  return (
    <section>
      <h2>Create Song</h2>

      <h3>What this feature is</h3>
      <p>Add a new song (title + artist, optional metadata) when it does not exist in search.</p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/songs">Back to Songs</a>
        </li>
        <li>
          <a href="/songs/example-song-id">Example Song Detail</a>
        </li>
      </ul>

      <h3>Primary fields</h3>
      <ul>
        <li>Title (required)</li>
        <li>Artist (required)</li>
        <li>Album (optional)</li>
        <li>Year (optional)</li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>POST /v1/songs</code>
        </li>
        <li>
          <code>GET /v1/songs</code> (to confirm it appears in search)
        </li>
      </ul>

      <h3>Edge cases</h3>
      <ul>
        <li>Duplicate song (same title + artist)</li>
        <li>Validation failures (missing title/artist)</li>
      </ul>
    </section>
  )
}
