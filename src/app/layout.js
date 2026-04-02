import '../styles/globals.css'

function Nav() {
  return (
    <nav>
      <a href="/">Home</a>
      {' | '}
      <a href="/login">Login</a>
      {' | '}
      <a href="/songs">Songs</a>
      {' | '}
      <a href="/ratings">Ratings</a>
      {' | '}
      <a href="/bookmarks">Bookmarks</a>
      {' | '}
      <a href="/searches">Search History</a>
      {' | '}
      <a href="/activity">Activity</a>
      {' | '}
      <a href="/friends">Friends</a>
      {' | '}
      <a href="/profile">Profile</a>
    </nav>
  )
}

function FloatingBackground() {
  return (
    <div className="floating-bg" aria-hidden="true">
      <span className="float-item float-1">♪</span>
      <span className="float-item float-2">♫</span>
      <span className="float-item float-3">♩</span>
      <span className="float-item float-4">♬</span>
      <span className="float-item float-5">★</span>
      <span className="float-item float-6">★★★★★</span>
      <span className="float-item float-7">♪</span>
      <span className="float-item float-8">★★★</span>
    </div>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <FloatingBackground />
          <header className="app-header">
            <h1>Scorely</h1>
            <Nav />
          </header>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  )
}
