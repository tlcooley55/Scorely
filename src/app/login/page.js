export default function LoginPage() {
  return (
    <section>
      <h2>Authentication</h2>

      <h3>What this feature is</h3>
      <p>
        Authentication lets users create an account, sign in, and sign out so they can store ratings
        and follow friends.
      </p>

      <h3>Links</h3>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/profile">My Profile</a>
        </li>
        <li>
          <a href="/songs">Songs</a>
        </li>
      </ul>

      <h3>User stories</h3>
      <ul>
        <li>User Story 1: Create an account to store music ratings.</li>
        <li>User Story 9 (rejected): Log in (treated as a system requirement, still needed).</li>
      </ul>

      <h3>MVP requirements (from PRD)</h3>
      <ul>
        <li>Email/password sign up and sign in</li>
        <li>Magic link sign in</li>
        <li>Google sign in</li>
        <li>Sign out</li>
        <li>Profiles row exists for each signed-in user</li>
      </ul>

      <h3>Primary screens / flows</h3>
      <ol>
        <li>
          <strong>Sign up</strong>
          <div>Create account with email/password, then redirect into the app.</div>
        </li>
        <li>
          <strong>Sign in</strong>
          <div>Sign in with email/password, magic link, or Google.</div>
        </li>
        <li>
          <strong>Sign out</strong>
          <div>Clear auth session and redirect to Login.</div>
        </li>
      </ol>

      <h3>API endpoints used (server)</h3>
      <ul>
        <li>Supabase Auth (client-side): sign up / sign in / OAuth</li>
        <li>
          Scorely API (server-side):
          <ul>
            <li>
              <code>PATCH /v1/me/profile</code> (create profile on first login if missing)
            </li>
            <li>
              <code>GET /v1/me/profile</code> (read profile)
            </li>
          </ul>
        </li>
      </ul>

      <h3>Edge cases</h3>
      <ul>
        <li>Username already taken</li>
        <li>Invalid email/password</li>
        <li>Magic link expired</li>
        <li>Google OAuth canceled</li>
      </ul>
    </section>
  )
}
