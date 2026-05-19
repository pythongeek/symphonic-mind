import { useRef, useEffect } from "react";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  isProcessing: boolean;
  barCount?: number;
}

export default function WaveformVisualizer({
  isPlaying,
  isProcessing,
  barCount = 64,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const barHeightsRef = useRef<number[]>(new Array(barCount).fill(0.5));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const barWidth = (canvasWidth / barCount) * 0.6;
    const gap = (canvasWidth / barCount) * 0.4;

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      timeRef.current += 0.016;

      for (let i = 0; i < barCount; i++) {
        let normalizedHeight: number;

        if (isProcessing) {
          // Processing state: all bars bounce together with high energy
          normalizedHeight =
            Math.sin(timeRef.current * 3 + i * 0.1) * 0.3 +
            0.5 +
            Math.random() * 0.2;
        } else if (isPlaying) {
          // Playing state: varied bar heights simulating audio
          normalizedHeight =
            Math.sin(timeRef.current * 2 + i * 0.2) * 0.4 +
            Math.sin(timeRef.current * 1.5 + i * 0.4) * 0.2 +
            Math.cos(timeRef.current * 2.5 + i * 0.15) * 0.15 +
            0.5 +
            Math.random() * 0.1;
        } else {
          // Idle state: gentle sine wave
          normalizedHeight =
            Math.sin(timeRef.current * 0.8 + i * 0.2) * 0.15 + 0.35;
        }

        // Clamp
        normalizedHeight = Math.max(0.05, Math.min(0.95, normalizedHeight));

        // Smooth interpolation
        barHeightsRef.current[i] +=
          (normalizedHeight - barHeightsRef.current[i]) * 0.15;

        const barHeight = barHeightsRef.current[i] * canvasHeight;
        const x = i * (barWidth + gap) + gap / 2;
        const y = canvasHeight - barHeight;

        // Gradient from Waveform Primary to Waveform Secondary
        const gradient = ctx.createLinearGradient(0, y, 0, canvasHeight);
        gradient.addColorStop(0, "#00e5a0");
        gradient.addColorStop(1, "#00c48c");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Glow effect for playing state
        if (isPlaying || isProcessing) {
          ctx.save();
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = "#00e5a0";
          ctx.shadowColor = "#00e5a0";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isProcessing, barCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
