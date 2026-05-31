import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold'
  size?: 'md' | 'lg'
  children: ReactNode
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-emerald2 text-white shadow-pop hover:brightness-105',
  secondary: 'bg-white text-emerald2-dark border-2 border-emerald2/20 shadow-pop hover:bg-sand-50',
  gold: 'bg-amber2 text-white shadow-pop hover:brightness-105',
  ghost: 'bg-transparent text-emerald2-dark hover:bg-emerald2/10',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const sizes = size === 'lg' ? 'px-7 py-4 text-lg' : 'px-5 py-3 text-base'
  return (
    <button
      {...rest}
      className={`btn-3d font-display font-700 rounded-2xl ${sizes} ${VARIANTS[variant]} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export function ProgressBar({
  value,
  className = '',
  color = 'bg-emerald2',
  height = 'h-3.5',
}: {
  value: number
  className?: string
  color?: string
  height?: string
}) {
  return (
    <div className={`w-full ${height} rounded-full bg-black/10 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white/90 backdrop-blur shadow-card border border-white ${className}`}>
      {children}
    </div>
  )
}

export function StatPill({ icon, label, value, color = 'text-emerald2-dark' }: { icon: string; label: string; value: ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white/90 px-3.5 py-2.5 shadow-card border border-white">
      <span className="text-2xl leading-none">{icon}</span>
      <div className="leading-tight">
        <div className={`font-display font-800 text-lg ${color}`}>{value}</div>
        <div className="text-[11px] uppercase tracking-wide text-stone-500 font-700">{label}</div>
      </div>
    </div>
  )
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-700 ${className}`}>{children}</span>
}
