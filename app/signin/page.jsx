"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../(core)/components/AuthProvider.jsx";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "../lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      if (mode === "signup") {
        await signUpWithEmail({ email, password });
      } else {
        await signInWithEmail({ email, password });
      }

      router.push("/");
    } catch (submitError) {
      setError(submitError.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/");
    } catch (submitError) {
      setError(submitError.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="auth-eyebrow">Firebase setup required</p>
          <h1>Sign in is not enabled yet</h1>
          <p>
            Add your Firebase keys to the environment file and reload the page.
          </p>
          <Link href="/" className="auth-button auth-button--primary">
            Return home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">Welcome</p>
        <h1>{mode === "signup" ? "Create an account" : "Sign in to V-LAB"}</h1>

        <div className="auth-toggle" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <button
          type="button"
          className="auth-button auth-button--secondary auth-button--full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form className="auth-form" onSubmit={handleEmailSubmit}>
          <label className="control-group">
            <span className="input-label">Email</span>
            <input
              className="input-text"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="control-group">
            <span className="input-label">Password</span>
            <input
              className="input-text"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button
            type="submit"
            className="auth-button auth-button--primary auth-button--full"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <Link href="/" className="auth-link">
          Back to home
        </Link>
      </section>
    </main>
  );
}
