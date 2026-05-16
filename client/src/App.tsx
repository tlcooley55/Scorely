import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { apiFetch } from './lib/api'
import { supabase } from './lib/supabase'

type Song = {
  song_id: string
  title: string
  artist: string
  album_art?: string | null
  genre?: string | null
  release_year?: number | null
  created_at?: string
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

type Tab = 'home' | 'search' | 'friends' | 'profile'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
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
          <div className="brandSubtitle">Rate. Save. Discover.</div>
        </div>
        {userEmail ? null : (
          <div className="auth">
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
          </div>
        )}
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
            {activeTab === 'home' ? (
              <HomeView
                onError={setGlobalError}
                onNavigate={(tab) => {
                  setSelectedSongId(null)
                  setActiveTab(tab)
                }}
              />
            ) : null}
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

      {userEmail ? (
        <footer className="footer">
          <div className="footerStatus">Signed in as <strong>{userEmail}</strong></div>
          <button
            className="btn secondary"
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
        </footer>
      ) : null}
    </div>
  )
}

function HomeView({
  onError: _onError,
  onNavigate,
}: {
  onError: (msg: string | null) => void
  onNavigate: (tab: Tab) => void
}) {
  return (
    <section className="panel hero">
      <div className="heroEyebrow">Welcome back</div>
      <h1>Rate the songs you love.</h1>
      <p className="heroLead">
        Find any song, give it a score, and curate your personal Top 5. Quick, simple, and yours.
      </p>
      <div className="quickActions">
        <button type="button" className="quickCard" onClick={() => onNavigate('search')}>
          <div className="quickIcon">🔍</div>
          <div className="quickTitle">Search</div>
          <div className="quickDesc">Find any song from the shared library.</div>
        </button>
        <button type="button" className="quickCard" onClick={() => onNavigate('search')}>
          <div className="quickIcon">⭐</div>
          <div className="quickTitle">Rate</div>
          <div className="quickDesc">Look up a song and score it 1–5.</div>
        </button>
        <button type="button" className="quickCard" onClick={() => onNavigate('profile')}>
          <div className="quickIcon">🏆</div>
          <div className="quickTitle">Top 5</div>
          <div className="quickDesc">View and edit your personal Top 5.</div>
        </button>
      </div>
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

  const [settingTop, setSettingTop] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [creating, setCreating] = useState(false)

  function isAlwaysVisibleSong(s: Song): boolean {
    const title = String(s.title ?? '').trim().toLowerCase()
    const artist = String(s.artist ?? '').trim().toLowerCase()
    return (
      (title === 'bad' && artist === 'michael jackson') ||
      (title === 'open my heart' && artist === 'yolanda adams')
    )
  }

  function filterSeedSongs(items: Song[]): Song[] {
    const cutoff = localStorage.getItem('scorely_user_song_start')
    if (!cutoff) return items

    const cutoffMs = Date.parse(cutoff)
    if (!Number.isFinite(cutoffMs)) return items

    return items.filter((s) => {
      if (isAlwaysVisibleSong(s)) return true
      const created = s.created_at ? Date.parse(String(s.created_at)) : NaN
      return Number.isFinite(created) && created >= cutoffMs
    })
  }

  async function runSearch() {
    setLoading(true)
    onError(null)
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
      const resp = await apiFetch<ApiListResponse<Song>>(`/songs${qs}`)
      setResults(filterSeedSongs(resp.data))
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

      if (!localStorage.getItem('scorely_user_song_start')) {
        localStorage.setItem('scorely_user_song_start', new Date().toISOString())
      }

      setNewTitle('')
      setNewArtist('')
      onSelectSong(created.song_id)
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreating(false)
    }
  }

  async function setTopSong(position: number, songId: string) {
    setSettingTop(true)
    onError(null)
    try {
      await apiFetch(`/me/top-songs/${position}`, {
        method: 'PUT',
        body: { song_id: songId },
      })
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      setSettingTop(false)
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
              {s.album_art ? <img className="albumArtThumb" src={s.album_art} alt="" /> : <div className="albumArtThumb albumArtPlaceholder" aria-hidden="true" />}
              <div className="listText">
                <div className="title">{s.title}</div>
                <div className="subtitle">{s.artist}</div>
              </div>
            </button>
            <div className="listActions">
              <select
                className="input"
                defaultValue=""
                onChange={async (e) => {
                  const value = e.target.value
                  e.currentTarget.value = ''
                  const pos = Number(value)
                  if (!Number.isInteger(pos) || pos < 1 || pos > 5) return
                  await setTopSong(pos, s.song_id)
                }}
                disabled={settingTop}
              >
                <option value="" disabled>
                  Set Top…
                </option>
                <option value="1">Top #1</option>
                <option value="2">Top #2</option>
                <option value="3">Top #3</option>
                <option value="4">Top #4</option>
                <option value="5">Top #5</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <details className="addSong">
        <summary>Can&rsquo;t find it? Add a song</summary>
        <div className="addSongBody">
          <div className="grid">
            <Field label="Title">
              <input className="input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </Field>
            <Field label="Artist">
              <input className="input" value={newArtist} onChange={(e) => setNewArtist(e.target.value)} />
            </Field>
          </div>
          <button className="btn" type="button" onClick={createSong} disabled={creating || !newTitle.trim() || !newArtist.trim()}>
            {creating ? 'Creating…' : 'Add & Rate'}
          </button>
        </div>
      </details>
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
      <p className="muted">Friends and their activity will appear here.</p>
      <div className="emptyState">
        <div className="emptyIcon">👥</div>
        <div className="emptyTitle">No friends yet</div>
        <div className="emptyDesc">Once friends are added, you&rsquo;ll see their recent ratings and Top 5s here.</div>
        {ok === false ? <div className="muted" style={{ marginTop: 8 }}>Connection issue — please try again later.</div> : null}
      </div>
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
      {profile ? null : null}

      <Divider />

      <div className="row spaceBetween">
        <h2>Top 5 songs</h2>
        <button className="btn secondary" type="button" onClick={loadTopSongs} disabled={loadingTop}>
          Refresh
        </button>
      </div>

      <div className="muted">Set or change a slot from Search → “Set Top…” on any song.</div>

      <div className="top5">
        {[1, 2, 3, 4, 5].map((pos) => {
          const current = byPosition.get(pos)
          return <Top5Row key={pos} position={pos} current={current} onClear={clearTopSong} />
        })}
      </div>
    </section>
  )
}

function Top5Row({
  position,
  current,
  onClear,
}: {
  position: number
  current?: TopSong
  onClear: (position: number) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)

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
          <div className="top5Song">
            {current.songs.album_art ? (
              <img className="albumArtThumb" src={current.songs.album_art} alt="" />
            ) : (
              <div className="albumArtThumb albumArtPlaceholder" aria-hidden="true" />
            )}
            <div className="top5Text">
              <div className="title">{current.songs.title}</div>
              <div className="subtitle">{current.songs.artist}</div>
              {current.songs.release_year ? (
                <div className="muted">{current.songs.release_year}</div>
              ) : null}
            </div>
          </div>
        ) : current ? (
          <div className="muted">Song saved (no details yet)</div>
        ) : (
          <div className="muted">Empty slot</div>
        )}
      </div>
      {current ? (
        <div className="top5Actions">
          <button className="btn secondary" type="button" onClick={handleClear} disabled={busy}>
            Clear
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default App
