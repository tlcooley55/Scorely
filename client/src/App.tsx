import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { apiFetch, getApiBase } from './lib/api'
import { supabase } from './lib/supabase'

type Song = {
  song_id: string
  title: string
  artist: string
  album_art?: string | null
  genre?: string | null
  release_year?: number | null
}

type Rating = {
  rating_id: string
  user_id: string
  song_id: string
  rating_value: number
  review?: string | null
  created_at: string
}

type TopSong = {
  top_song_id: string
  user_id: string
  song_id: string
  position: number
  created_at: string
  songs?: Song
}

type Profile = {
  user_id: string
  username: string
  created_at: string
}

type ApiListResponse<T> = {
  data: T[]
}

type ApiItemResponse<T> = T

function clampInt(value: unknown, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button className={active ? 'tab active' : 'tab'} onClick={onClick} type="button">
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

function Divider() {
  return <hr className="divider" />
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message && err.message.trim()) return err.message
    return String(err)
  }

  if (typeof err === 'string') return err

  try {
    const s = JSON.stringify(err)
    if (s && s !== '{}' && s !== 'null') return s
  } catch (_) {
    // ignore
  }

  return String(err)
}

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'friends' | 'profile'>('home')
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [awaitingCode, setAwaitingCode] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      if (cancelled) return
      setUserEmail(data.user?.email ?? null)
    }

    loadUser().catch(() => {})

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setGlobalError(null)
  }, [activeTab])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brandTitle">Scorely</div>
          <div className="brandSubtitle">API: {getApiBase()}</div>
        </div>
        <div className="auth">
          {userEmail ? (
            <>
              <div className="authStatus">Signed in as {userEmail}</div>
              <button
                className="tab"
                type="button"
                onClick={async () => {
                  setAuthBusy(true)
                  setGlobalError(null)
                  try {
                    await supabase.auth.signOut()
                    setAwaitingCode(false)
                    setAuthCode('')
                  } catch (err) {
                    console.error('Supabase signOut failed:', err)
                    setGlobalError(toErrorMessage(err))
                  } finally {
                    setAuthBusy(false)
                  }
                }}
                disabled={authBusy}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="authStatus">Sign in</div>
              <input
                className="input"
                placeholder="email@domain.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              {awaitingCode ? (
                <input
                  className="input"
                  placeholder="Enter code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
              ) : null}
              <button
                className="tab"
                type="button"
                onClick={async () => {
                  const email = authEmail.trim()
                  if (!email) {
                    setGlobalError('Enter an email address to sign in')
                    return
                  }
                  setAuthBusy(true)
                  setGlobalError(null)
                  try {
                    if (awaitingCode) {
                      const token = authCode.trim()
                      if (!token) {
                        setGlobalError('Enter the code from your email')
                        return
                      }
                      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
                      if (error) throw error
                      setAwaitingCode(false)
                      setAuthCode('')
                    } else {
                      const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: { emailRedirectTo: window.location.origin },
                      })
                      if (error) throw error
                      setAwaitingCode(true)
                      setGlobalError('Check your email for the login code/link, then return to this tab.')
                    }
                  } catch (err) {
                    console.error('Supabase auth failed:', err)
                    setGlobalError(toErrorMessage(err))
                  } finally {
                    setAuthBusy(false)
                  }
                }}
                disabled={authBusy}
              >
                {awaitingCode ? 'Verify code' : 'Send code'}
              </button>
              {awaitingCode ? (
                <button
                  className="tab"
                  type="button"
                  onClick={() => {
                    setAwaitingCode(false)
                    setAuthCode('')
                    setGlobalError(null)
                  }}
                  disabled={authBusy}
                >
                  Back
                </button>
              ) : null}
            </>
          )}
        </div>
        {userEmail ? (
          <nav className="tabs">
            <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')}>
              Home
            </TabButton>
            <TabButton
              active={activeTab === 'search'}
              onClick={() => {
                setSelectedSongId(null)
                setActiveTab('search')
              }}
            >
              Search
            </TabButton>
            <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>
              Friends
            </TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
              Profile
            </TabButton>
          </nav>
        ) : null}
      </header>

      {globalError ? <div className="error">{globalError}</div> : null}

      <main className="main">
        {userEmail ? (
          <>
            {activeTab === 'home' ? <HomeView onError={setGlobalError} /> : null}
            {activeTab === 'search' ? (
              selectedSongId ? (
                <SongDetailView songId={selectedSongId} onBack={() => setSelectedSongId(null)} onError={setGlobalError} />
              ) : (
                <SearchView onSelectSong={(id) => setSelectedSongId(id)} onError={setGlobalError} />
              )
            ) : null}
            {activeTab === 'friends' ? <FriendsView onError={setGlobalError} /> : null}
            {activeTab === 'profile' ? <ProfileView onError={setGlobalError} /> : null}
          </>
        ) : (
          <section className="panel">
            <h1>Sign in</h1>
            <p>Enter your email above and click “Send code”.</p>
          </section>
        )}
      </main>
    </div>
  )
}

function HomeView({ onError }: { onError: (msg: string | null) => void }) {
  const [health, setHealth] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      onError(null)
      try {
        const data = await apiFetch('/health')
        if (!cancelled) setHealth(data)
      } catch (err) {
        if (!cancelled) onError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [onError])

  return (
    <section className="panel">
      <h1>Home</h1>
      <p>
        Search → Rate → Save → Discover through friends. Ratings & reviews are combined directly on the Song Detail
        screen.
      </p>
      <Divider />
      <h2>Status</h2>
      {loading ? <div>Loading…</div> : <pre className="pre">{JSON.stringify(health, null, 2)}</pre>}
    </section>
  )
}

function SearchView({
  onSelectSong,
  onError,
}: {
  onSelectSong: (songId: string) => void
  onError: (msg: string | null) => void
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [creating, setCreating] = useState(false)

  async function runSearch() {
    setLoading(true)
    onError(null)
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
      const resp = await apiFetch<ApiListResponse<Song>>(`/songs${qs}`)
      setResults(resp.data)
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function createSong() {
    setCreating(true)
    onError(null)
    try {
      const payload = { title: newTitle.trim(), artist: newArtist.trim() }
      const created = await apiFetch<ApiItemResponse<Song>>('/songs', { method: 'POST', body: payload })
      setNewTitle('')
      setNewArtist('')
      onSelectSong(created.song_id)
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreating(false)
    }
  }

  async function copySongId(songId: string) {
    onError(null)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(songId)
        return
      }
      throw new Error('Clipboard not available')
    } catch (err) {
      onError('Copy failed. Tap and hold the Song ID to copy it.')
    }
  }

  return (
    <section className="panel">
      <h1>Search</h1>
      <div className="row">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or artist…"
        />
        <button className="btn" type="button" onClick={runSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <Divider />

      <h2>Results</h2>
      {results.length === 0 ? <div className="muted">No results yet.</div> : null}
      <div className="list">
        {results.map((s) => (
          <div key={s.song_id} className="listItem">
            <button className="listMain" onClick={() => onSelectSong(s.song_id)} type="button">
              <div className="title">{s.title}</div>
              <div className="subtitle">{s.artist}</div>
              <div className="muted">{s.song_id}</div>
            </button>
            <button className="btn secondary" type="button" onClick={() => copySongId(s.song_id)}>
              Copy Song ID
            </button>
          </div>
        ))}
      </div>

      <Divider />

      <h2>Add a song (inline)</h2>
      <div className="grid">
        <Field label="Title">
          <input className="input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </Field>
        <Field label="Artist">
          <input className="input" value={newArtist} onChange={(e) => setNewArtist(e.target.value)} />
        </Field>
      </div>
      <button className="btn" type="button" onClick={createSong} disabled={creating || !newTitle.trim() || !newArtist.trim()}>
        {creating ? 'Creating…' : 'Create + Rate'}
      </button>
    </section>
  )
}

function SongDetailView({
  songId,
  onBack,
  onError,
}: {
  songId: string
  onBack: () => void
  onError: (msg: string | null) => void
}) {
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)

  const [ratingValue, setRatingValue] = useState(5)
  const [review, setReview] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      onError(null)
      try {
        const data = await apiFetch<ApiItemResponse<Song>>(`/songs/${encodeURIComponent(songId)}`)
        if (!cancelled) setSong(data)
      } catch (err) {
        if (!cancelled) onError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [songId, onError])

  async function saveRating() {
    setSaving(true)
    onError(null)
    try {
      const payload = {
        song_id: songId,
        rating_value: clampInt(ratingValue, 1, 5),
        review: review.trim() ? review.trim() : null,
      }

      try {
        await apiFetch<ApiItemResponse<Rating>>('/ratings', { method: 'POST', body: payload })
        return
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes('409')) throw err
      }

      const mine = await apiFetch<ApiListResponse<Rating>>('/me/ratings?limit=100')
      const existing = mine.data.find((r) => r.song_id === songId)
      if (!existing) throw new Error('Could not locate existing rating to update')

      await apiFetch<ApiItemResponse<Rating>>(`/ratings/${existing.rating_id}`, {
        method: 'PATCH',
        body: { rating_value: payload.rating_value, review: payload.review },
      })
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel">
      <div className="row spaceBetween">
        <h1>Song Detail</h1>
        <button className="btn secondary" type="button" onClick={onBack}>
          Back
        </button>
      </div>

      {loading ? <div>Loading…</div> : null}
      {song ? (
        <>
          <div className="songHeader">
            {song.album_art ? <img className="albumArt" src={song.album_art} alt="" /> : null}
            <div>
              <div className="title">{song.title}</div>
              <div className="subtitle">{song.artist}</div>
              {song.release_year ? <div className="muted">{song.release_year}</div> : null}
            </div>
          </div>

          <Divider />

          <div className="ratingSection">
            <h2>Rating + Review</h2>
            <div className="grid">
              <Field label="Stars (1–5)">
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={5}
                  value={ratingValue}
                  onChange={(e) => setRatingValue(Number(e.target.value))}
                />
              </Field>
              <Field label="Review (optional, max 500 chars)">
                <textarea className="textarea" value={review} maxLength={500} onChange={(e) => setReview(e.target.value)} />
              </Field>
            </div>

            <button className="btn" type="button" onClick={saveRating} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}

function FriendsView({ onError }: { onError: (msg: string | null) => void }) {
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      onError(null)
      try {
        await apiFetch('/friends?limit=1')
        if (!cancelled) setOk(true)
      } catch (err) {
        if (!cancelled) {
          setOk(false)
          onError(err instanceof Error ? err.message : String(err))
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [onError])

  return (
    <section className="panel">
      <h1>Friends</h1>
      <p className="muted">This view will list friends and their activity. Kept minimal for now.</p>
      <Divider />
      <div>Friends API reachable: {ok === null ? '…' : ok ? 'yes' : 'no'}</div>
    </section>
  )
}

function ProfileView({ onError }: { onError: (msg: string | null) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)

  const [topSongs, setTopSongs] = useState<TopSong[]>([])
  const [loadingTop, setLoadingTop] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      onError(null)
      try {
        const me = await apiFetch<ApiItemResponse<Profile>>('/me/profile')
        if (!cancelled) {
          setProfile(me)
          setUsername(me.username ?? '')
        }
      } catch (err) {
        if (!cancelled) onError(err instanceof Error ? err.message : String(err))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [onError])

  async function loadTopSongs() {
    setLoadingTop(true)
    onError(null)
    try {
      const resp = await apiFetch<ApiListResponse<TopSong>>('/me/top-songs')
      setTopSongs(resp.data)
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoadingTop(false)
    }
  }

  useEffect(() => {
    loadTopSongs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveProfile() {
    setSaving(true)
    onError(null)
    try {
      const updated = await apiFetch<ApiItemResponse<Profile>>('/me/profile', {
        method: 'PATCH',
        body: { username: username.trim() },
      })
      setProfile(updated)
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function setTopSong(position: number, songId: string) {
    onError(null)
    try {
      await apiFetch<ApiItemResponse<TopSong>>(`/me/top-songs/${position}`, {
        method: 'PUT',
        body: { song_id: songId.trim() },
      })
      await loadTopSongs()
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  async function clearTopSong(position: number) {
    onError(null)
    try {
      await apiFetch(`/me/top-songs/${position}`, { method: 'DELETE' })
      await loadTopSongs()
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  const byPosition = useMemo(() => {
    const m = new Map<number, TopSong>()
    for (const t of topSongs) m.set(t.position, t)
    return m
  }, [topSongs])

  return (
    <section className="panel">
      <h1>Profile</h1>

      <h2>My info</h2>
      <div className="grid">
        <Field label="Username">
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </Field>
      </div>
      <button className="btn" type="button" onClick={saveProfile} disabled={saving || !username.trim()}>
        {saving ? 'Saving…' : 'Save profile'}
      </button>
      {profile ? <div className="muted">User id: {profile.user_id}</div> : null}

      <Divider />

      <div className="row spaceBetween">
        <h2>Top 5 songs (manual)</h2>
        <button className="btn secondary" type="button" onClick={loadTopSongs} disabled={loadingTop}>
          Refresh
        </button>
      </div>

      <div className="muted">Set each slot by pasting a Song ID (UUID) from Search results.</div>

      <div className="top5">
        {[1, 2, 3, 4, 5].map((pos) => {
          const current = byPosition.get(pos)
          return <Top5Row key={pos} position={pos} current={current} onSet={setTopSong} onClear={clearTopSong} />
        })}
      </div>
    </section>
  )
}

function Top5Row({
  position,
  current,
  onSet,
  onClear,
}: {
  position: number
  current?: TopSong
  onSet: (position: number, songId: string) => Promise<void>
  onClear: (position: number) => Promise<void>
}) {
  const [songId, setSongId] = useState('')
  const [busy, setBusy] = useState(false)

  function normalizeSongId(input: string): string {
    const raw = String(input ?? '')
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .trim()
    if (!raw) return ''

    const m = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
    if (m) return m[0]

    const hex = raw.replace(/[^0-9a-f]/gi, '')
    if (hex.length === 32) {
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    }

    return raw
  }

  async function handleSet() {
    setBusy(true)
    try {
      await onSet(position, normalizeSongId(songId))
      setSongId('')
    } catch (_) {
      // keep input so user can correct/try again
    } finally {
      setBusy(false)
    }
  }

  async function handleClear() {
    setBusy(true)
    try {
      await onClear(position)
    } catch (_) {
      // ignore
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="top5Row">
      <div className="top5Pos">#{position}</div>
      <div className="top5Body">
        {current?.songs ? (
          <div>
            {current.songs.album_art ? <img className="albumArt" src={current.songs.album_art} alt="" /> : null}
            <div className="title">{current.songs.title}</div>
            <div className="subtitle">{current.songs.artist}</div>
            <div className="muted">{current.song_id}</div>
          </div>
        ) : current ? (
          <div>
            <div className="title">Song</div>
            <div className="muted">{current.song_id}</div>
          </div>
        ) : (
          <div className="muted">Empty</div>
        )}
      </div>
      <div className="top5Actions">
        <input
          className="input"
          placeholder="Song UUID"
          value={songId}
          onChange={(e) => setSongId(normalizeSongId(e.target.value))}
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="row">
          <button className="btn" type="button" onClick={handleSet} disabled={busy || !songId.trim()}>
            Set
          </button>
          <button className="btn secondary" type="button" onClick={handleClear} disabled={busy}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
