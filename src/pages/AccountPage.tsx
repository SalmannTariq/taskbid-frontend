import { useState } from "react";
import { errorMessage, logout } from "../api";
import { Brand } from "../components/Field";
import type { SessionUser } from "../types/user.types";

export function AccountPage({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    setError(null);
    try {
      await logout();
      onSignOut();
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not sign out."));
      setBusy(false);
    }
  }

  return (
    <section className="card account">
      <Brand />
      <h1>Signed in</h1>
      {user.name && <p className="name">{user.name}</p>}
      <p className="lede">{user.email}</p>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" className="btn" disabled={busy} onClick={() => void signOut()}>
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </section>
  );
}
