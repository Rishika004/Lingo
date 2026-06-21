"use client";

import { motion, useReducedMotion } from "motion/react";
import { SpinnerGap, ArrowRight } from "@phosphor-icons/react";

interface GenerateButtonProps {
  loading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function GenerateButton({ loading, onClick, disabled }: GenerateButtonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={reduced ? {} : { scale: 0.98 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.875rem 1.5rem",
        background: disabled || loading ? "var(--color-border)" : "var(--color-primary)",
        border: "none",
        borderRadius: "0.375rem",
        color: disabled || loading ? "var(--color-muted)" : "#fff",
        fontFamily: "var(--font-geist-sans), sans-serif",
        fontSize: "0.9375rem",
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        letterSpacing: "0.01em",
        transition: "background 0.15s",
      }}
    >
      {loading ? (
        <>
          <SpinnerGap size={17} className="animate-spin" />
          Generating your posts...
        </>
      ) : (
        <>
          Generate Posts
          <ArrowRight size={17} />
        </>
      )}
    </motion.button>
  );
}
