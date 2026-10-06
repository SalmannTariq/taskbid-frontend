import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { errorMessage, login } from "../../api";
import { Brand, Field } from "../../components/Field";
import { useSession } from "../../session";

export function SignInPage() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateSignIn(email, password);
    if (next) {
      setError(next);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      signIn(await login(email.trim(), password));
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not sign in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <Brand />
      <h1>Sign in</h1>
      <p className="lede">Use the email and password for your account.</p>
      <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
      <Field
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        autoComplete="current-password"
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="switch">
        No account yet?{" "}
        <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}

function validateSignIn(email: string, password: string) {
  if (!email.trim()) return "Email is required.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email.";
  if (!password) return "Password is required.";
  return null;
}
