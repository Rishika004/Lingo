"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";

interface VoiceSamplesProps {
  onChange: (samples: string[]) => void;
}

export default function VoiceSamples({ onChange }: VoiceSamplesProps) {
  const [expanded, setExpanded] = useState(false);
  const [post1, setPost1] = useState("");
  const [post2, setPost2] = useState("");
  const reduced = useReducedMotion();

  function handlePost1Change(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPost1(e.target.value);
    onChange([e.target.value, post2]);
  }

  function handlePost2Change(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPost2(e.target.value);
    onChange([post1, e.target.value]);
  }

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    color: "var(--color-ink)",
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontSize: "0.875rem",
    resize: "vertical",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    color: "var(--color-muted)",
    marginBottom: "0.375rem",
  };

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1rem",
          background: "transparent",
          border: "none",
          color: "var(--color-muted)",
          fontFamily: "var(--font-geist-sans), sans-serif",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}
      >
        <span>Add your voice (optional)</span>
        <motion.span
          animate={reduced ? {} : { rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          style={{ display: "flex" }}
        >
          <CaretDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="voice-content"
            initial={reduced ? {} : { height: 0, opacity: 0 }}
            animate={reduced ? {} : { height: "auto", opacity: 1 }}
            exit={reduced ? {} : { height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 1rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Past post 1</label>
                <textarea rows={3} value={post1} onChange={handlePost1Change} style={textareaStyle} />
              </div>
              <div>
                <label style={labelStyle}>Past post 2 (optional)</label>
                <textarea rows={3} value={post2} onChange={handlePost2Change} style={textareaStyle} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
