"use client";

import { useFormStatus } from "react-dom";

function SignInButton({ configured }: { configured: boolean }) {
  const { pending } = useFormStatus();
  return <button className="admin-primary admin-signin-button" type="submit" disabled={!configured || pending} aria-busy={pending}>
    {pending && <span className="admin-spinner" aria-hidden="true"/>}
    <span aria-live="polite" aria-atomic="true">{pending ? "Signing in…" : "Sign in"}</span>
  </button>;
}

export function SignInForm({ action, configured }: { action: (formData: FormData) => void | Promise<void>; configured: boolean }) {
  return <form action={action} aria-label="Staff sign in">
    <label>Email address<input required type="email" name="email" autoComplete="username"/></label>
    <label>Password<input required type="password" name="password" autoComplete="current-password"/></label>
    <SignInButton configured={configured}/>
  </form>;
}
