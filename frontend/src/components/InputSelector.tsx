"use client";

import { useState, useRef } from "react";

type InputType = "github" | "image" | "text";

interface InputSelectorProps {
  onChange: (type: InputType, value: string) => void;
}

const TABS: { key: InputType; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "image", label: "Image" },
  { key: "text", label: "Text" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  background: "#fff",
  border: "1px solid var(--color-border)",
  borderRadius: "0.25rem",
  color: "var(--color-ink)",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.15s",
};

export default function InputSelector({ onChange }: InputSelectorProps) {
  const [activeTab, setActiveTab] = useState<InputType>("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [imageB64, setImageB64] = useState("");
  const [textValue, setTextValue] = useState("");
  const [imageName, setImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTabChange(tab: InputType) {
    setActiveTab(tab);
    const currentValue = tab === "github" ? githubUrl : tab === "image" ? imageB64 : textValue;
    onChange(tab, currentValue);
  }

  function handleGithubChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGithubUrl(e.target.value);
    onChange("github", e.target.value);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTextValue(e.target.value);
    onChange("text", e.target.value);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImageB64(b64);
      onChange("image", b64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {/* Tab strip */}
      <div style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid var(--color-border)",
        marginBottom: "1rem",
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--color-ink)" : "2px solid transparent",
                color: isActive ? "var(--color-ink)" : "var(--color-muted)",
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "color 0.15s",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "github" && (
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "0.4rem" }}>
            Repository URL
          </div>
          <input
            type="url"
            placeholder="https://github.com/user/repo"
            value={githubUrl}
            onChange={handleGithubChange}
            style={inputStyle}
          />
        </div>
      )}

      {activeTab === "image" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "1.5px dashed var(--color-border)",
            borderRadius: "0.375rem",
            padding: "2.5rem 1rem",
            textAlign: "center",
            cursor: "pointer",
            color: "var(--color-muted)",
            fontSize: "0.875rem",
            transition: "border-color 0.15s, background 0.15s",
            background: "#faf9f7",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)";
            (e.currentTarget as HTMLElement).style.background = "#f5f3ef";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
            (e.currentTarget as HTMLElement).style.background = "#faf9f7";
          }}
        >
          {imageName
            ? <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{imageName}</span>
            : <span>Click to upload an image</span>
          }
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {activeTab === "text" && (
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "0.4rem" }}>
            Your content
          </div>
          <textarea
            rows={5}
            placeholder="Share what you've been working on, learning, or thinking about..."
            value={textValue}
            onChange={handleTextChange}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      )}
    </div>
  );
}
