"use client";

import { useEffect, useRef } from "react";

const KEYWORDS = [
  "shipped it", "built this", "open source", "day 1", "launched",
  "side project", "in public", "lessons learned", "excited to share",
  "proud of this", "6 months ago", "thread", "milestone", "grateful",
];

interface Card {
  x: number;
  y: number;
  vy: number;
  vx: number;
  w: number;
  lines: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface Word {
  x: number;
  y: number;
  vy: number;
  text: string;
  opacity: number;
  maxOpacity: number;
  fontSize: number;
  phase: "in" | "hold" | "out";
  phaseTimer: number;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", resize);

    // Ghost post cards
    const cards: Card[] = Array.from({ length: 6 }, (_, i) => ({
      x: (W / 6) * i + Math.random() * 60 - 30,
      y: Math.random() * H,
      vy: -(0.2 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 0.1,
      w: 160 + Math.random() * 100,
      lines: 3 + Math.floor(Math.random() * 3),
      opacity: 0.25 + Math.random() * 0.15,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.007 + Math.random() * 0.005,
    }));

    // Floating keyword words
    const words: Word[] = Array.from({ length: 8 }, () => {
      const text = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
      const maxO = 0.22 + Math.random() * 0.18;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vy: -(0.15 + Math.random() * 0.2),
        text,
        opacity: 0,
        maxOpacity: maxO,
        fontSize: 11 + Math.floor(Math.random() * 8),
        phase: "in" as const,
        phaseTimer: Math.random() * 120,
      };
    });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // --- Floating cards ---
      for (const card of cards) {
        card.pulse += card.pulseSpeed;
        const cardH = card.lines * 18 + 44;
        const a = card.opacity + Math.sin(card.pulse) * 0.015;

        ctx.save();

        // card fill
        ctx.globalAlpha = a * 0.4;
        ctx.fillStyle = "rgba(45, 36, 32, 0.08)";
        rr(ctx, card.x, card.y, card.w, cardH, 8);
        ctx.fill();

        // card border
        ctx.globalAlpha = a;
        ctx.strokeStyle = "rgba(45, 36, 32, 0.45)";
        ctx.lineWidth = 1.2;
        rr(ctx, card.x, card.y, card.w, cardH, 8);
        ctx.stroke();

        // avatar circle
        ctx.globalAlpha = a * 0.7;
        ctx.fillStyle = "rgba(45, 36, 32, 0.12)";
        ctx.beginPath();
        ctx.arc(card.x + 18, card.y + 18, 9, 0, Math.PI * 2);
        ctx.fill();

        // name line
        ctx.globalAlpha = a * 0.5;
        ctx.fillStyle = "rgba(45, 36, 32, 0.3)";
        rr(ctx, card.x + 33, card.y + 12, card.w * 0.35, 4, 2);
        ctx.fill();

        // sub line
        ctx.globalAlpha = a * 0.3;
        rr(ctx, card.x + 33, card.y + 20, card.w * 0.22, 3, 1.5);
        ctx.fill();

        // text lines
        for (let i = 0; i < card.lines; i++) {
          const lw = (card.w - 20) * (i === 0 ? 0.9 : 0.45 + Math.random() * 0.4);
          ctx.globalAlpha = a * 0.25;
          ctx.fillStyle = "rgba(45, 36, 32, 0.25)";
          rr(ctx, card.x + 10, card.y + 38 + i * 18, lw, 4, 2);
          ctx.fill();
        }

        ctx.restore();

        card.x += card.vx;
        card.y += card.vy;
        if (card.y + cardH < 0) { card.y = H + 20; card.x = Math.random() * W; }
        if (card.x < -card.w - 20) card.x = W + 20;
        if (card.x > W + card.w + 20) card.x = -card.w;
      }

      // --- Floating keywords ---
      for (const word of words) {
        word.phaseTimer--;

        if (word.phase === "in") {
          word.opacity = Math.min(word.maxOpacity, word.opacity + 0.003);
          if (word.opacity >= word.maxOpacity) { word.phase = "hold"; word.phaseTimer = 180 + Math.random() * 240; }
        } else if (word.phase === "hold") {
          if (word.phaseTimer <= 0) word.phase = "out";
        } else {
          word.opacity = Math.max(0, word.opacity - 0.003);
          if (word.opacity <= 0) {
            word.x = Math.random() * W;
            word.y = H + 20;
            word.text = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
            word.maxOpacity = 0.06 + Math.random() * 0.07;
            word.phase = "in";
          }
        }

        word.y += word.vy;
        if (word.y < -30) { word.y = H + 20; word.x = Math.random() * W; word.opacity = 0; word.phase = "in"; }

        ctx.save();
        ctx.globalAlpha = word.opacity;
        ctx.fillStyle = "rgba(45, 36, 32, 0.9)";
        ctx.font = `500 ${word.fontSize}px ui-monospace, monospace`;
        ctx.fillText(word.text, word.x, word.y);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
