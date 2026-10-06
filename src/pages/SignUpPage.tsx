import { useState, type FormEvent } from "react";
import { errorMessage, register } from "../api";
import { Brand, Field } from "../components/Field";
import { followLink } from "../router";
import type { UserType } from "../../types/user.types";
import type { SessionUser } from "../../types/user.types";

export function SignUpPage({ onSuccess }: { onSuccess: (user: SessionUser) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [maxHours, setMaxHours] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validateSignUp(values: UserType) {
    if (!values.name.trim()) return "Name is required.";
    if (!values.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) return "Enter a valid email.";
    if (!values.password) return "Password is required.";
    if (!Number.isFinite(values.hourlyRate) || values.hourlyRate <= 0) return "Hourly rate must be greater than 0.";
    if (!Number.isFinite(values.maxHours) || values.maxHours <= 0) return "Max hours must be greater than 0.";
    return null;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateSignUp({ name, email, password, hourlyRate, maxHours });
    if (next) {
      setError(next);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        hourlyRate,
        maxHours,
      });
      onSuccess(result.user);
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not create the account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <Brand />
      <h1>Create account</h1>
      <p className="lede">Name, email, and how much work you can take on.</p>
      <Field label="Name" value={name} onChange={setName} autoComplete="name" />
      <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
      <Field
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        autoComplete="new-password"
      />
      <div className="row">
        <Field
          label="Hourly rate"
          value={hourlyRate === 0 ? "" : String(hourlyRate)}
          onChange={(value) => setHourlyRate(value === "" ? 0 : Number(value))}
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          placeholder="45.00"
        />
        <Field
          label="Max hours"
          value={maxHours === 0 ? "" : String(maxHours)}
          onChange={(value) => setMaxHours(value === "" ? 0 : Number(value))}
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          placeholder="40"
        />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="switch">
        Already have an account?{" "}
        <a href="/signin" onClick={(event) => followLink(event, "/signin")}>
          Sign in
        </a>
      </p>
    </form>
  );
}
