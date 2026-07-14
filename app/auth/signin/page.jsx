"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password.");
      return;
    }

    if (result?.ok) {
      window.location.href = "/";
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <h1>Sign in to LegalAssist</h1>
        <p>Use your credentials to access the secure legal document analyzer.</p>
      </section>

      <section className="tool-card">
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="field-row">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {error && <div className="alert error">{error}</div>}
        </form>
      </section>
    </main>
  );
}
