import { NAMES, type DivineName } from '../../data/names'

export type Question =
  | { kind: 'meaningToName'; nameId: number; prompt: string; options: DivineName[]; answerId: number }
  | { kind: 'nameToMeaning'; nameId: number; prompt: string; options: DivineName[]; answerId: number }
  | { kind: 'memory'; nameId: number; prompt: string; answer: string }
  | { kind: 'match'; nameIds: number[] }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function byId(id: number): DivineName {
  return NAMES.find((n) => n.id === id)!
}

function distractors(correctId: number, n: number): DivineName[] {
  return shuffle(NAMES.filter((x) => x.id !== correctId)).slice(0, n)
}

// Build a varied quiz from the given target names, cycling through all 4 types.
export function buildQuiz(targetIds: number[]): Question[] {
  const ids = [...targetIds]
  const questions: Question[] = []

  ids.forEach((id, i) => {
    const name = byId(id)
    const mode = i % 3
    if (mode === 0) {
      const options = shuffle([name, ...distractors(id, 3)])
      questions.push({
        kind: 'meaningToName',
        nameId: id,
        prompt: `Who is "${name.meaning}"?`,
        options,
        answerId: id,
      })
    } else if (mode === 1) {
      const options = shuffle([name, ...distractors(id, 3)])
      questions.push({
        kind: 'nameToMeaning',
        nameId: id,
        prompt: `What does ${name.transliteration} mean?`,
        options,
        answerId: id,
      })
    } else {
      questions.push({
        kind: 'memory',
        nameId: id,
        prompt: name.transliteration,
        answer: name.meaning,
      })
    }
  })

  // Add a match-pairs round when there are enough names.
  if (ids.length >= 3) {
    questions.push({ kind: 'match', nameIds: shuffle(ids).slice(0, Math.min(5, ids.length)) })
  }

  return shuffle(questions)
}

export { byId }
