"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../(core)/components/AuthProvider.jsx";
import {
  sendOtpToPhone,
  verifyPhoneOtp,
} from "../lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  
  // Phone flow state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Timer state
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      if (!phoneNumber.trim()) {
        throw new Error("Please enter your mobile number.");
      }
      
      const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`;
      const result = await sendOtpToPhone({ phoneNumber: fullPhoneNumber });
      setConfirmationResult(result);
      setOtpSent(true);
      setOtpCode(["", "", "", "", "", ""]);
      setCountdown(30); // 30 seconds timer
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

      const fullOtp = otpCode.join("");
      if (fullOtp.length !== 6) {
        throw new Error("Please enter the 6-digit OTP.");
      }

      await verifyPhoneOtp({ confirmationResult, otpCode: fullOtp });
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
    setOtpCode(["", "", "", "", "", ""]);
    setPhoneNumber("");
    setError("");
    setCountdown(0);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    } else if (e.key === "Enter" && otpCode.join("").length === 6) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex].focus();
  };

  if (!isConfigured) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a14]">
        <div className="text-white text-center">
          <h1 className="text-2xl" style={{ marginBottom: "1rem" }}>Firebase setup required</h1>
          <p>Add your Firebase keys to the environment file and reload the page.</p>
        </div>
      </main>
    );
  }

  // Masked phone number logic
  const maskedPhone = `${countryCode} ${phoneNumber.substring(0, 2)}******${phoneNumber.substring(phoneNumber.length - 2)}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050510] relative overflow-hidden font-sans">
      {/* Subtle Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "-4s" }}></div>
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none"></div>

      <div className="vlab-glass-wrap relative z-10 w-full max-w-md">
        <div className="vlab-glass-panel relative rounded-[28px] border border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-2xl">
          {/* Top highlight sheen */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[28px]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.25) inset, 0 -1px 0 rgba(255,255,255,0.05) inset",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%)",
            }}
          />

          <div className="flex flex-col items-center w-full relative z-20">
            {/* VLABS Branding */}
            <div className="vlab-glass-badge flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="vlab-glass-title text-2xl font-light text-white tracking-wide text-center">Welcome to VLABS</h1>

            {!otpSent ? (
              <p className="vlab-glass-subtitle text-white/50 text-sm text-center font-light">
                Enter your mobile number to sign in or create an account.
              </p>
            ) : (
              <p className="vlab-glass-subtitle text-white/50 text-sm text-center font-light">
                We've sent a code to <br/><span className="text-white/80 font-medium">{maskedPhone}</span>
              </p>
            )}

            <div className="vlab-glass-fields w-full">
              {!otpSent ? (
                <>
                  <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors duration-300">
                    <select
                      className="vlab-glass-control bg-transparent text-white/80 outline-none border-r border-white/10 appearance-none font-light"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91" className="bg-[#111]">IN (+91)</option>
                      <option value="+1" className="bg-[#111]">US (+1)</option>
                      <option value="+44" className="bg-[#111]">UK (+44)</option>
                    </select>
                    <input
                      type="tel"
                      className="vlab-glass-control flex-1 bg-transparent text-white outline-none font-light placeholder-white/30"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      autoComplete="tel"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm text-center font-light">{error}</p>}

                  <button
                    type="button"
                    onClick={!loading ? handleSendOtp : undefined}
                    className={`vlab-glass-btn relative w-full rounded-xl font-medium overflow-hidden border border-white/15 backdrop-blur-xl transition-all duration-300 ${
                      loading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white active:scale-[0.98] shadow-lg shadow-black/20'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="vlab-glass-otp-row flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>

                  {error && <p className="text-red-400 text-sm text-center font-light">{error}</p>}

                  <button
                    type="button"
                    onClick={!loading ? handleVerifyOtp : undefined}
                    className={`vlab-glass-btn relative w-full rounded-xl font-medium overflow-hidden border border-white/15 backdrop-blur-xl transition-all duration-300 ${
                      loading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white active:scale-[0.98] shadow-lg shadow-black/20'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : "Verify & Continue"}
                  </button>

                  <div className="vlab-glass-links flex flex-col items-center gap-3">
                    <button
                      type="button"
                      className="text-white/50 hover:text-white/80 text-sm font-light transition-colors"
                      onClick={handleSendOtp}
                      disabled={loading || countdown > 0}
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                    </button>
                    <button
                      type="button"
                      className="text-white/40 hover:text-white/70 text-xs font-light transition-colors"
                      onClick={resetPhoneFlow}
                      disabled={loading}
                    >
                      Change number
                    </button>
                  </div>
                </>
              )}
            </div>

            <div id="recaptcha-container" className="hidden" />
          </div>
        </div>
      </div>
      
      {/*
        The project's global reset (app/(core)/styles/base/reset.css) applies
        a universal margin/padding reset outside of any layer, which — per CSS
        cascade layer rules — always wins over Tailwind's layered utilities,
        silently zeroing out Tailwind padding, margin and space-y classes.
        These scoped rules use plain class selectors, which beat the reset
        on specificity, matching how the rest of the codebase's hand-written
        CSS already coexists with it.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .vlab-glass-wrap { padding-left: 1rem; padding-right: 1rem; }
        .vlab-glass-panel { padding: 2.25rem 1.75rem; }
        @media (min-width: 640px) {
          .vlab-glass-panel { padding: 2.5rem 2.25rem; }
        }
        .vlab-glass-badge { margin-bottom: 1.5rem; }
        .vlab-glass-title { margin-bottom: 0.5rem; }
        .vlab-glass-subtitle { margin-bottom: 2rem; }
        .vlab-glass-fields { display: flex; flex-direction: column; gap: 1.5rem; }
        .vlab-glass-control { padding: 0.75rem 1rem; }
        .vlab-glass-btn { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .vlab-glass-otp-row { margin-bottom: 1rem; }
        .vlab-glass-links { margin-top: 1.5rem; }
      `}} />
    </main>
  );
}
