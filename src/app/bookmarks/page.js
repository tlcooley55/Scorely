export default function BookmarksPage() {
  return (
    <section>
      <h2>Bookmarks</h2>

      <h3>What this feature is</h3>
      <p>
        Bookmarks let you save songs you want to come back to later. A bookmark is tied to your account
        and references a song.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/songs">Find a song to bookmark</a>
        </li>
        <li>
          <a href="/songs/example-song-id">Example Song Detail</a>
        </li>
        <li>
          <a href="/ratings">Rate &amp; Review a Song</a>
        </li>
        <li>
          <a href="/profile">My Profile</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 7: Bookmark songs so I can come back to them later.</li>
      </ul>

      <h3>Rules / constraints</h3>
      <ul>
        <li>
          <strong>Uniqueness:</strong> one bookmark per (user, song)
        </li>
        <li>
          <strong>Ownership:</strong> you can only delete your own bookmarks
        </li>
      </ul>

      <h3>Primary UI pieces</h3>
      <ul>
        <li>
          <strong>Bookmarks list</strong>
          <div>Shows bookmarked songs (often newest first)</div>
        </li>
        <li>
          <strong>Add bookmark</strong>
          <div>Triggered from song detail or search results</div>
        </li>
        <li>
          <strong>Remove bookmark</strong>
          <div>Deletes a bookmark</div>
        </li>
      </ul>

      <h3>API endpoints used</h3>
      <ul>
        <li>
          <code>GET /v1/bookmarks</code>
          <div>List my bookmarks</div>
        </li>
        <li>
          <code>POST /v1/bookmarks</code>
          <div>Create a bookmark (body: song_id)</div>
        </li>
        <li>
          <code>GET /v1/bookmarks/:bookmarkId</code>
          <div>Get bookmark detail by id</div>
        </li>
        <li>
          <code>DELETE /v1/bookmarks/:bookmarkId</code>
          <div>Delete a bookmark I own</div>
        </li>
      </ul>

      <h3>Error cases</h3>
      <ul>
        <li>422 validation failed (song_id missing or not a UUID)</li>
        <li>403 operation not allowed (trying to delete someone else’s bookmark)</li>
        <li>404 resource not found</li>
      </ul>
    </section>
  )
}
