"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../(core)/components/AuthProvider.jsx";
import {
  sendOtpToPhone,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  verifyPhoneOtp,
} from "../lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const [mode, setMode] = useState("login");
  const [authMethod, setAuthMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      if (!phoneNumber.trim()) {
        throw new Error("Please enter your mobile number.");
      }

      const result = await sendOtpToPhone({ phoneNumber: phoneNumber.trim() });
      setConfirmationResult(result);
      setOtpSent(true);
      setOtpCode("");
    } catch (submitError) {
      setError(submitError.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("Please request an OTP before verifying it.");
      }

      if (!otpCode.trim()) {
        throw new Error("Please enter the 6-digit OTP.");
      }

      await verifyPhoneOtp({ confirmationResult, otpCode: otpCode.trim() });
      router.push("/");
    } catch (submitError) {
      setError(submitError.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setOtpSent(false);
    setConfirmationResult(null);
    setOtpCode("");
    setPhoneNumber("");
    setError("");
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
        <h1>{authMethod === "email" ? (mode === "signup" ? "Create an account" : "Sign in to V-LAB") : "Continue with mobile"}</h1>

        <div className="auth-toggle" aria-label="Authentication method">
          <button
            type="button"
            className={authMethod === "email" ? "active" : ""}
            onClick={() => {
              setAuthMethod("email");
              setError("");
            }}
          >
            Email
          </button>
          <button
            type="button"
            className={authMethod === "phone" ? "active" : ""}
            onClick={() => {
              setAuthMethod("phone");
              setError("");
              setOtpSent(false);
              setConfirmationResult(null);
              setOtpCode("");
            }}
          >
            Phone
          </button>
        </div>

        {authMethod === "email" ? (
          <>
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
          </>
        ) : (
          <div className="auth-form">
            <label className="control-group">
              <span className="input-label">Mobile number</span>
              <input
                className="input-text"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+91 9876543210"
                autoComplete="tel"
              />
            </label>

            {!otpSent ? (
              <button
                type="button"
                className="auth-button auth-button--primary auth-button--full"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                <label className="control-group">
                  <span className="input-label">OTP</span>
                  <input
                    className="input-text"
                    type="text"
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    autoComplete="one-time-code"
                  />
                </label>

                <button
                  type="button"
                  className="auth-button auth-button--primary auth-button--full"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="auth-button auth-button--secondary auth-button--full"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  className="auth-button auth-button--secondary auth-button--full"
                  onClick={resetPhoneFlow}
                  disabled={loading}
                >
                  Change number
                </button>
              </>
            )}

            {error ? <p className="auth-error">{error}</p> : null}
          </div>
        )}

        <div id="recaptcha-container" />

        <Link href="/" className="auth-link">
          Back to home
        </Link>
      </section>
    </main>
  );
}
