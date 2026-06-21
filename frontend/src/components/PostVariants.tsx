"use client";

import PostCard from "./PostCard";

interface Variant {
  text: string;
  score: number;
  improvement: string;
}

interface PostVariantsProps {
  variants: Variant[];
  bestIndex: number;
  generationTimeMs: number;
  onPublish: (text: string) => void;
}

export default function PostVariants({ variants, bestIndex, generationTimeMs, onPublish }: PostVariantsProps) {
  const seconds = (generationTimeMs / 1000).toFixed(1);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "1rem" }}>
        <h2
          style={{
            margin: 0,
            color: "var(--color-ink)",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          Your posts
        </h2>
        <span
          style={{
            color: "var(--color-muted)",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.75rem",
          }}
        >
          Generated in {seconds}s
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {variants.map((variant, i) => (
          <PostCard
            key={i}
            variant={variant}
            index={i}
            isBest={i === bestIndex}
            onPublish={onPublish}
          />
        ))}
      </div>
    </div>
  );
}
