"use client";

import { useEffect, useRef } from "react";
import { AVATAR_SIZE, buildAvatarSpec } from "@/lib/pixelAvatar";

export default function PixelAvatarCanvas({
  seed,
  size = 200,
}: {
  seed: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spec = buildAvatarSpec(seed);
    const cell = size / AVATAR_SIZE;

    canvas.width = size;
    canvas.height = size;
    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < AVATAR_SIZE; r++) {
      for (let c = 0; c < AVATAR_SIZE; c++) {
        ctx.fillStyle = spec.grid[r][c];
        ctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }
  }, [seed, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    />
  );
}
