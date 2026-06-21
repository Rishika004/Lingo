"use client";

const OPTIONS = ["Founder", "Engineer", "Job Seeker", "Recruiter"];

interface AudienceSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function AudienceSelector({ value, onChange }: AudienceSelectorProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      {OPTIONS.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "0.375rem",
              border: `1.5px solid ${isSelected ? "var(--color-ink)" : "var(--color-border)"}`,
              background: isSelected ? "var(--color-ink)" : "var(--color-surface)",
              color: isSelected ? "#fff" : "var(--color-ink)",
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "0.875rem",
              fontWeight: isSelected ? 600 : 400,
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s, color 0.15s",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
