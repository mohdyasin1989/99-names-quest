# 99 Names Quest 🌙

A bright, gamified web app that helps children (ages 7–15) **memorize and retain** the 99 Names of Allah — the Arabic name, transliteration, meaning, and a simple child-friendly explanation — through spaced repetition, quizzes, XP, levels, streaks, badges, and a visual progress map.

Built with **React + TypeScript + Tailwind CSS**. No backend — everything persists in the browser via `localStorage`. Deployable to Vercel as-is.

---

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To make a production build:

```bash
npm run build      # type-checks, then builds to /dist
npm run preview    # serves the built /dist locally
```

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel, **New Project → Import** the repo.
3. Vercel auto-detects Vite. Defaults are correct:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. `vercel.json` already adds the SPA rewrite so refreshes work.

(You can also run `npx vercel` from this folder to deploy directly.)

---

## What's inside

| Feature | Where |
|---|---|
| All 99 Names (Arabic, transliteration, meaning, explanation) | `src/data/names.ts` |
| Onboarding: pick new Names-per-day (1/3/5/7/custom) | `src/screens/Onboarding.tsx`, `src/lib/plan.ts` |
| Adjustable daily pace anytime (Settings) | `src/screens/Settings.tsx` |
| Dashboard: level, XP, streak, learned/remaining, % complete | `src/screens/Dashboard.tsx` |
| Daily lesson → learn cards → quiz → honest results | `src/screens/Lesson.tsx` |
| 4 quiz types (meaning→name, name→meaning, match pairs, memory/fuzzy) | `src/components/quiz/` |
| XP rewards (10/5/25/15) + 7 levels | `src/lib/xp.ts` |
| Spaced repetition (1/3/7/14/30-day boxes, 0–100 mastery) | `src/lib/srs.ts` |
| Due reviews + on-demand "Review Previous Names" | `src/screens/Review.tsx` |
| Visual progress map (locked/current/practising/learned/mastered) | `src/screens/ProgressMap.tsx` |
| 8 badges | `src/lib/badges.ts`, `src/screens/BadgesScreen.tsx` |
| Parent dashboard (seen vs learned, pace, time) | `src/screens/ParentDashboard.tsx` |
| Game state, persistence & save migration | `src/context/GameContext.tsx`, `src/lib/storage.ts` |

## What changed in v2.0

- **Adjustable pace.** The plan is now driven by "new Names per day" instead of a fixed schedule. Change it anytime in Settings — fewer if it's tough, more if it's easy — and nothing is redistributed or lost.
- **No pressure / no pile-ups.** Only one new-Names lesson per calendar day. Missing days never stacks a backlog; you simply pick up the next batch when you return.
- **Review previous Names.** A always-available button to practise any Names already learned, separate from the spaced-repetition "due" reviews.
- **Honest progress.** A Name only counts as *learned* once it's answered correctly in a quiz — not just from reading the card. The lesson summary shows exactly which Names were learned and which still need practice; the rest reappear in reviews.
- **Golden Arabic.** The Arabic Names now render in a shimmering gold (a nod to the gilded Dome of the Rock) for clarity and beauty.
- Existing saved progress is automatically migrated to the new model, so nobody loses their streak or learned Names.

## XP & levels

- Learn a new name **+10**, correct answer **+5**, lesson complete **+25**, review session **+15**, perfect quiz bonus on top.
- Levels: Explorer → Seeker → Student → Learner → Scholar → Guardian → Master of the Names. Thresholds live in `src/lib/xp.ts` and are easy to expand.

## Spaced repetition

A simplified Leitner system. A correct answer raises mastery (+20) and moves the name to the next interval box (1→3→7→14→30 days). A wrong answer drops mastery (−25) and resets it to the 1-day box. Lower-mastery and more-overdue names surface first in Review.

## Resetting data

Everything is stored under the `localStorage` key `99-names-quest:v1`. The Parent Dashboard has a **Reset** button, or clear site data in the browser.

---

## A note on the content

Transliterations and English meanings are taken from the provided reference sheet (`www.99NamesofAllah.name`). The Arabic script is written with the definite article and diacritics. The one-line child-friendly explanations were written fresh for this app to be simple and warm. Please have a knowledgeable adult review the wording before wide use with children.

## Tech notes

- Vite 5, React 18, TypeScript (strict), Tailwind 3.
- Fonts (Google Fonts): Baloo 2 (display), Nunito (body), Scheherazade New (Arabic).
- Mobile-first, large tap targets, high-contrast colors, no dark theme.
