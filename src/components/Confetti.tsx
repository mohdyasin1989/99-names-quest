import { useMemo } from 'react'

const COLORS = ['#0f8a6e', '#11a6a6', '#f6a623', '#e8b923', '#ff7a59', '#6b4e8f']

// Lightweight CSS-only confetti burst.
export function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 8,
        rounded: Math.random() > 0.5,
      })),
    [count],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confettifall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.rounded ? '50%' : '3px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
