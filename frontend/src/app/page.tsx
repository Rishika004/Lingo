"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import InputSelector from "@/components/InputSelector";
import AudienceSelector from "@/components/AudienceSelector";
import ToneSelector from "@/components/ToneSelector";
import VoiceSamples from "@/components/VoiceSamples";
import VoiceImport from "@/components/VoiceImport";
import GenerateButton from "@/components/GenerateButton";
import PostVariants from "@/components/PostVariants";
import PublishModal from "@/components/PublishModal";

interface Variant {
  text: string;
  score: number;
  improvement: string;
}

interface User {
  name: string;
  picture?: string;
  sub: string;
}

const STEPS = ["INPUT", "AUDIENCE", "TONE", "GENERATE"];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(0);
  const [inputType, setInputType] = useState<string>("github");
  const [inputValue, setInputValue] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [voiceSamples, setVoiceSamples] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [bestIndex, setBestIndex] = useState(0);
  const [genTime, setGenTime] = useState(0);
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  function handleInputChange(type: string, value: string) {
    setInputType(type);
    setInputValue(value);
  }

  async function handleGenerate() {
    setLoading(true);
    setVariants([]);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: inputType,
          input_value: inputValue,
          audience,
          tone,
          voice_samples: voiceSamples,
        }),
      });
      const data = await res.json();
      setVariants(data.variants ?? []);
      setBestIndex(data.best_index ?? 0);
      setGenTime(data.generation_time_ms);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function canAdvance() {
    if (step === 0) return inputValue.trim().length > 0;
    if (step === 1) return audience.length > 0;
    if (step === 2) return tone.length > 0;
    return false;
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--color-muted)",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", position: "relative" }}>
      <BackgroundAnimation />
      {/* Top nav */}
      <nav style={{
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        height: "68px",
        gap: "1.5rem",
        position: "relative",
        zIndex: 1,
      }}>
        <img
          src="/lingo-logo.png"
          alt="LINGO"
          style={{ height: "52px", width: "auto", objectFit: "contain" }}
        />
        <span style={{ color: "var(--color-border)", fontSize: "1rem" }}>→</span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", letterSpacing: "0.05em" }}>
          {STEPS.join(" · ")}
        </span>

        {/* Auth — pushed to right */}
        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              {user.picture && (
                <img src={user.picture} alt={user.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <span style={{ fontSize: "0.8125rem", color: "var(--color-ink)", fontWeight: 500 }}>{user.name}</span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "0.25rem 0.75rem",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/linkedin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.875rem",
                background: "#0A66C2",
                borderRadius: "0.25rem",
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "var(--font-geist-sans), sans-serif",
              }}
            >
              Login with LinkedIn
            </a>
          )}
        </div>
      </nav>

      {/* Step progress bar */}
      <div style={{
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        padding: "1.25rem 2rem 0",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: "860px",
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
        }}>
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {/* Connector line left */}
                {i > 0 && (
                  <div style={{
                    position: "absolute",
                    top: 14,
                    left: 0,
                    width: "50%",
                    height: 1,
                    background: done || active ? "var(--color-accent)" : "var(--color-border)",
                    zIndex: 0,
                  }} />
                )}
                {/* Connector line right */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute",
                    top: 14,
                    right: 0,
                    width: "50%",
                    height: 1,
                    background: done ? "var(--color-accent)" : "var(--color-border)",
                    zIndex: 0,
                  }} />
                )}
                {/* Circle */}
                <div
                  onClick={() => done && setStep(i)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `1.5px solid ${done ? "var(--color-accent)" : active ? "var(--color-ink)" : "var(--color-border)"}`,
                    background: done ? "var(--color-accent)" : active ? "var(--color-ink)" : "var(--color-bg)",
                    color: done || active ? "#fff" : "var(--color-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    cursor: done ? "pointer" : "default",
                    zIndex: 1,
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.06em",
                  color: active ? "var(--color-ink)" : "var(--color-muted)",
                  fontWeight: active ? 600 : 400,
                  marginTop: "0.375rem",
                  marginBottom: "0.875rem",
                }}>
                  {String(i + 1).padStart(2, "0")} {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 2rem 4rem", position: "relative", zIndex: 1 }}>

        {/* Step heading */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-ink)", lineHeight: 1.2 }}>
            {step === 0 && "What are you sharing?"}
            {step === 1 && "Who is your audience?"}
            {step === 2 && "What tone should we use?"}
            {step === 3 && "Ready to generate"}
          </h1>
          <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: "var(--color-muted)", lineHeight: 1.6 }}>
            {step === 0 && "Paste a GitHub link, upload an image, or describe what you've built."}
            {step === 1 && "Your post will be written with this reader in mind."}
            {step === 2 && "This shapes the voice and energy of your post."}
            {step === 3 && `Sharing via ${inputType} · ${audience} · ${tone}`}
          </p>
        </div>

        {/* Step content */}
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.75rem",
          padding: "1.75rem",
          marginBottom: "1.5rem",
        }}>
          {step === 0 && (
            <div>
              <label style={labelStyle}>Source</label>
              <InputSelector onChange={handleInputChange} />

              <div style={{ marginTop: "1.5rem" }}>
                <label style={labelStyle}>Your writing voice</label>
                {user
                  ? <VoiceImport user={user} onImported={setVoiceSamples} />
                  : <VoiceSamples onChange={setVoiceSamples} />
                }
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label style={labelStyle}>Target audience</label>
              <AudienceSelector value={audience} onChange={setAudience} />
            </div>
          )}

          {step === 2 && (
            <div>
              <label style={labelStyle}>Tone</label>
              <ToneSelector value={tone} onChange={setTone} />
            </div>
          )}

          {step === 3 && (
            <div>
              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Source", value: inputType.toUpperCase() },
                  { label: "Audience", value: audience || "—" },
                  { label: "Tone", value: tone || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ borderTop: "2px solid var(--color-border)", paddingTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: "0.25rem" }}>{label}</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-ink)" }}>{value}</div>
                  </div>
                ))}
              </div>

              <GenerateButton loading={loading} onClick={handleGenerate} disabled={false} />

              {error && (
                <p style={{ marginTop: "1rem", color: "var(--color-error)", fontSize: "0.875rem" }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {step < 3 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                padding: "0.625rem 1.25rem",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "0.375rem",
                color: step === 0 ? "var(--color-border)" : "var(--color-muted)",
                fontSize: "0.875rem",
                cursor: step === 0 ? "not-allowed" : "pointer",
                fontFamily: "var(--font-geist-sans), sans-serif",
              }}
            >
              ← Back
            </button>

            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!canAdvance()}
              style={{
                padding: "0.625rem 1.5rem",
                background: canAdvance() ? "var(--color-primary)" : "var(--color-border)",
                border: "none",
                borderRadius: "0.375rem",
                color: canAdvance() ? "#fff" : "var(--color-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: canAdvance() ? "pointer" : "not-allowed",
                fontFamily: "var(--font-geist-sans), sans-serif",
                transition: "background 0.15s",
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Results */}
        {variants.length > 0 && (
          <section style={{ marginTop: "2.5rem" }}>
            <PostVariants
              variants={variants}
              bestIndex={bestIndex}
              generationTimeMs={genTime}
              onPublish={(text) => setPublishTarget(text)}
            />
          </section>
        )}
      </main>

      {publishTarget && (
        <PublishModal text={publishTarget} user={user} onClose={() => setPublishTarget(null)} />
      )}
    </div>
  );
}
