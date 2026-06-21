"use client";

import { useEffect, useState } from "react";
import { SpinnerGap, CheckCircle, WarningCircle, LinkedinLogo } from "@phosphor-icons/react";

interface VoiceImportProps {
  user: { name: string; vanityName?: string } | null;
  onImported: (posts: string[]) => void;
}

type Status = "idle" | "loading" | "done" | "failed" | "manual";

export default function VoiceImport({ user, onImported }: VoiceImportProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [posts, setPosts] = useState<string[]>([]);
  const [manualText, setManualText] = useState("");

  useEffect(() => {
    if (!user?.vanityName) return;
    setStatus("loading");

    fetch("/api/voice/extract")
      .then((r) => r.json())
      .then((data) => {
        if (data.posts?.length > 0) {
          setPosts(data.posts);
          onImported(data.posts);
          setStatus("done");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [user?.vanityName]);

  function handleManualSubmit() {
    const lines = manualText
      .split("\n---\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 40);
    if (lines.length === 0) return;
    onImported(lines);
    setPosts(lines);
    setStatus("done");
  }

  if (!user) return null;

  return (
    <div style={{
      border: "1px solid var(--color-border)",
      borderRadius: "0.5rem",
      overflow: "hidden",
      background: "var(--color-surface)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        borderBottom: status !== "manual" && status !== "failed" ? "none" : "1px solid var(--color-border)",
        background: "#f0f7ff",
      }}>
        <LinkedinLogo size={15} style={{ color: "#0A66C2", flexShrink: 0 }} />
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink)", flex: 1 }}>
          Voice import from {user.name}&apos;s posts
        </span>

        {status === "loading" && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--color-muted)" }}>
            <SpinnerGap size={13} className="animate-spin" /> Fetching...
          </span>
        )}
        {status === "done" && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#2d6a4f" }}>
            <CheckCircle size={13} /> {posts.length} posts imported
          </span>
        )}
        {status === "failed" && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--color-muted)" }}>
            <WarningCircle size={13} /> Auto-import unavailable
          </span>
        )}
      </div>

      {/* Done state — show preview */}
      {status === "done" && (
        <div style={{ padding: "0.875rem 1rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--color-muted)" }}>
            Your writing style has been captured. Posts will be generated in your tone.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {posts.slice(0, 2).map((p, i) => (
              <div key={i} style={{
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                background: "#faf9f7",
                border: "1px solid var(--color-border)",
                borderRadius: "0.25rem",
                padding: "0.375rem 0.625rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                &ldquo;{p.slice(0, 90)}&hellip;&rdquo;
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed / manual paste fallback */}
      {(status === "failed" || status === "manual") && (
        <div style={{ padding: "0.875rem 1rem" }}>
          <p style={{ margin: "0 0 0.625rem", fontSize: "0.75rem", color: "var(--color-muted)", lineHeight: 1.5 }}>
            Paste 2-3 of your recent LinkedIn posts below, separated by{" "}
            <code style={{ background: "#f0f0ee", padding: "0.1rem 0.3rem", borderRadius: "0.2rem", fontSize: "0.7rem" }}>---</code>.
            {" "}
            <a
              href={`https://www.linkedin.com/in/${user.vanityName ?? ""}/recent-activity/all/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0A66C2", textDecoration: "none", fontWeight: 500 }}
            >
              Open your LinkedIn activity →
            </a>
          </p>
          <textarea
            rows={6}
            placeholder={"Your first post here...\n---\nYour second post here...\n---\nYour third post here..."}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              background: "#faf9f7",
              border: "1px solid var(--color-border)",
              borderRadius: "0.375rem",
              color: "var(--color-ink)",
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              marginBottom: "0.625rem",
            }}
          />
          <button
            onClick={handleManualSubmit}
            disabled={manualText.trim().length < 40}
            style={{
              padding: "0.5rem 1.25rem",
              background: manualText.trim().length >= 40 ? "var(--color-primary)" : "var(--color-border)",
              border: "none",
              borderRadius: "0.375rem",
              color: manualText.trim().length >= 40 ? "#fff" : "var(--color-muted)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: manualText.trim().length >= 40 ? "pointer" : "not-allowed",
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
          >
            Use these posts for tone
          </button>
        </div>
      )}
    </div>
  );
}
