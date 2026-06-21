"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X, LinkedinLogo, SpinnerGap, CheckCircle } from "@phosphor-icons/react";

interface PublishModalProps {
  text: string;
  user: { name: string; picture?: string } | null;
  onClose: () => void;
}

export default function PublishModal({ text, user, onClose }: PublishModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<"review" | "loading" | "success" | "error">("review");
  const [errorMsg, setErrorMsg] = useState("");
  const reduced = useReducedMotion();

  async function handlePost() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const postText = textareaRef.current?.value ?? text;
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: postText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to publish.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={reduced ? {} : { scale: 0.96, opacity: 0 }}
        animate={reduced ? {} : { scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.75rem",
          width: "100%",
          maxWidth: "520px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.125rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LinkedinLogo size={18} style={{ color: "#0A66C2" }} />
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-ink)" }}>
              Review before posting
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {status === "success" ? (
          <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
            <CheckCircle size={40} style={{ color: "var(--color-success)", marginBottom: "0.75rem" }} />
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-ink)", margin: "0 0 0.25rem" }}>
              Posted to LinkedIn!
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: 0 }}>
              Your post is live.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: "1.5rem",
                padding: "0.625rem 1.5rem",
                background: "var(--color-primary)",
                border: "none",
                borderRadius: "0.375rem",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "var(--font-geist-sans), sans-serif",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: "1.5rem" }}>
            {/* Who's posting */}
            {user && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "1.25rem",
                padding: "0.625rem 0.875rem",
                background: "#f0f7ff",
                borderRadius: "0.375rem",
                border: "1px solid #c8dff5",
              }}>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                  />
                )}
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink)" }}>{user.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#0A66C2" }}>Posting as you on LinkedIn</div>
                </div>
              </div>
            )}

            {/* Editable post */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "0.5rem",
              }}>
                Edit your post
              </label>
              <textarea
                ref={textareaRef}
                defaultValue={text}
                rows={8}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "#faf9f7",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.375rem",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            {status === "error" && (
              <p style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "var(--color-error)" }}>
                {errorMsg}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.375rem",
                  color: "var(--color-muted)",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={status === "loading"}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.75rem",
                  background: status === "loading" ? "var(--color-border)" : "var(--color-primary)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: status === "loading" ? "var(--color-muted)" : "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading"
                  ? <><SpinnerGap size={15} className="animate-spin" /> Posting...</>
                  : <><LinkedinLogo size={15} /> Post to LinkedIn</>
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
