// Levenshtein distance for the typed "memory challenge" quiz.
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(the|a|an|of|and)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Fuzzy match: forgiving of typos and minor wording differences.
export function fuzzyMatch(input: string, target: string): boolean {
  const a = normalize(input)
  const b = normalize(target)
  if (!a) return false
  if (a === b) return true
  // Accept if the answer contains the key word(s) or vice-versa.
  if (b.includes(a) && a.length >= 4) return true
  if (a.includes(b) && b.length >= 4) return true
  const dist = levenshtein(a, b)
  const tolerance = Math.max(2, Math.floor(b.length * 0.34))
  return dist <= tolerance
}
