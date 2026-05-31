export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        onClick={onBack}
        aria-label="Go back"
        className="btn-3d flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-xl shadow-card border border-white"
      >
        ←
      </button>
      <h1 className="font-display font-800 text-2xl text-emerald2-dark">{title}</h1>
    </div>
  )
}
