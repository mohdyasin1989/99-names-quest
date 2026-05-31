import type { DivineName } from '../data/names'

// The learning flashcard shown during a daily lesson.
export function NameCard({ name, index, total }: { name: DivineName; index: number; total: number }) {
  return (
    <div className="animate-pop rounded-3xl bg-white shadow-card border border-white overflow-hidden">
      <div className="relative bg-gradient-to-br from-emerald2 to-teal2 px-6 pt-7 pb-8 text-center text-white pattern-stars">
        <div className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-800">
          {index + 1} / {total}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-800">#{name.id}</div>
        <div className="font-arabic text-6xl sm:text-7xl leading-tight mt-3 drop-shadow" dir="rtl">
          {name.arabic}
        </div>
      </div>
      <div className="px-6 py-6 text-center">
        <div className="font-display font-800 text-2xl text-emerald2-dark">{name.transliteration}</div>
        <div className="mt-1 text-lg font-700 text-amber2">{name.meaning}</div>
        <div className="mx-auto mt-4 h-px w-16 bg-stone-200" />
        <p className="mt-4 text-stone-600 text-[17px] leading-relaxed text-balance">{name.explanation}</p>
      </div>
    </div>
  )
}
