"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CopySimple, LinkedinLogo, LightbulbFilament } from "@phosphor-icons/react";

interface PostVariant {
  text: string;
  score: number;
  improvement: string;
}

interface PostCardProps {
  variant: PostVariant;
  index: number;
  isBest: boolean;
  onPublish: (text: string) => void;
}

export default function PostCard({ variant, index, isBest, onPublish }: PostCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  async function handleCopy() {
    const text = textareaRef.current?.value ?? variant.text;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePublish() {
    const text = textareaRef.current?.value ?? variant.text;
    onPublish(text);
  }

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={reduced ? {} : { opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.1, delay: index * 0.07 }}
      style={{
        background: "var(--color-surface)",
        border: `1.5px solid ${isBest ? "var(--color-ink)" : "var(--color-border)"}`,
        borderRadius: "0.5rem",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
        }}>
          Variant {index + 1}
        </span>
        <span style={{
          background: "var(--color-accent)",
          color: "#fff",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.68rem",
          fontWeight: 700,
          padding: "0.1rem 0.45rem",
          borderRadius: "0.25rem",
        }}>
          {variant.score}/10
        </span>
        {isBest && (
          <span style={{
            background: "var(--color-ink)",
            color: "#fff",
            fontSize: "0.65rem",
            fontWeight: 600,
            padding: "0.1rem 0.45rem",
            borderRadius: "0.25rem",
            letterSpacing: "0.03em",
          }}>
            Best pick
          </span>
        )}
      </div>

      {/* Post text */}
      <textarea
        ref={textareaRef}
        defaultValue={variant.text}
        rows={6}
        style={{
          width: "100%",
          background: "#faf9f7",
          border: "1px solid var(--color-border)",
          borderRadius: "0.25rem",
          padding: "0.75rem",
          color: "var(--color-ink)",
          fontFamily: "var(--font-geist-sans), sans-serif",
          fontSize: "0.875rem",
          lineHeight: 1.65,
          resize: "vertical",
          outline: "none",
        }}
      />

      {/* Improvement tip */}
      <div style={{ display: "flex", gap: "0.375rem", alignItems: "flex-start" }}>
        <LightbulbFilament size={13} style={{ color: "var(--color-accent)", marginTop: "0.15rem", flexShrink: 0 }} />
        <p style={{ color: "var(--color-muted)", fontSize: "0.75rem", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
          {variant.improvement}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.875rem" }}>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.5rem 0.875rem",
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "0.25rem",
            color: "var(--color-muted)",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "0.8125rem",
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-ink)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-muted)";
          }}
        >
          <CopySimple size={13} />
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={handlePublish}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.5rem 0.875rem",
            background: "var(--color-primary)",
            border: "none",
            borderRadius: "0.25rem",
            color: "#fff",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <LinkedinLogo size={13} />
          Publish
        </button>
      </div>
    </motion.div>
  );
}
