# Tempo — Design System

**Tempo** turns any document into smart flashcards and notes, with an AI study assistant that drafts study spaces, exams, and tutoring on top of what you upload. The product is a focused, data-rich **learning workspace**: you import material, Tempo generates structured notes + flashcards, and a layer of analytics, spaced-repetition review, groups, and a public explore feed keeps you progressing.

This design system captures Tempo's **dark-first, violet-accented product UI** as reusable tokens, React components, foundation specimens, and a full app UI kit.

---

## Sources

This system was reconstructed from **7 product screenshots** provided by the team (no Figma file or codebase was supplied):

| File | Surface |
|---|---|
| `uploads/logo.png` | App icon (book + flag mark on a blue rounded square) |
| `uploads/Analysis_tab.png` | Analytics dashboard (the flagship view) |
| `uploads/Group_tab.png` | Groups — my groups + explore + sessions |
| `uploads/explore_tab.png` | Explore — trending study spaces, resources |
| `uploads/study_space_in_library.png` | Library → Study Spaces grid |
| `uploads/note_in_library.png` | Library → Notes grid (level badges) |
| `uploads/flashcard_in_library.png` | Library → Flashcards grid |

> ⚠️ **No source code or Figma was available** — components are visual recreations measured from the screenshots (colors sampled pixel-accurately). If a codebase or Figma exists, attach it via the Import menu so the kit can be reconciled against real component code.

---

## Content fundamentals

How Tempo writes copy.

- **Voice:** second person, encouraging, momentum-oriented — the product is literally named for *pace*. Microcopy cheers you on: "Keep it up!", "You're improving!", "Focus on these topics to improve your overall mastery."
- **Tone:** confident and supportive, never clinical. AI insights are phrased as a helpful coach, not a system log ("You're most productive between 7PM – 10PM").
- **Casing:** Headings and section titles use **Title Case** ("Study Time by Type", "Review Forecast", "Top Learners"). Body copy is sentence case. Status/level tags are **ALL CAPS** ("DETAILED", "NORMAL", "BASIC", "PUBLIC", "PRIVATE", "SHARED", "STUDYING").
- **You vs I:** always "you / your". The user owns the journey ("your learning journey", "your study spaces", "Created by me" is the lone first-person, used as a filter label).
- **Numbers are the message.** Copy leans on concrete metrics: "128h 45m", "3,842 cards reviewed", "+22% mastery", "23 days" streak. Deltas always carry a comparison window ("vs May 5 – May 18").
- **Verbs for actions:** short, direct — Upload, Review Now, Join, Create Group, Apply Filters, Continue, Upgrade Now.
- **Emoji:** used **sparingly and only as motivational accents** — the streak 🔥 flame, an occasional 🎉/🏆. Never in headings, labels, or as bullet decoration. Functional iconography is always drawn (Lucide-style line icons), never emoji.
- **Examples of section subtitles:** "Track your progress and improve your learning journey." · "Study together, share resources, and achieve more as a team." · "Discover high-quality study resources shared by learners around the world."

---

## Visual foundations

- **Mood:** focused, nocturnal, premium-edtech. A deep **blue-black canvas** (`--bg-base` #0A0C13) with content floating on slightly lighter cards. Reads like a pro dashboard, not a playful consumer app.
- **Color:** one dominant accent — **violet `#8B5CF6`** — used for primary actions, active nav, progress, and highlights. The brand signature is an **indigo→violet gradient** (`--grad-brand`, #6366F1 → #A073F9 → #C264F5) seen in the TEMPO wordmark, CTAs, and progress fills. Everything else is restrained: muted blue-grays for text, and a small semantic set (green success, blue info, amber warning, coral danger).
- **Subject accents:** study spaces are color-coded by discipline — CS violet, Math blue, Science green, Languages amber, Biology teal, Physics coral. Used for icon chips and banner tints, never for large fills.
- **Type:** **Space Grotesk** for display/wordmark/big numbers (geometric, techy), **Plus Jakarta Sans** for all UI/body (clean humanist grotesque), **JetBrains Mono** for metrics and keyboard hints. Headings are tight-tracked; the wordmark is wide-tracked uppercase.
- **Backgrounds:** flat dark surfaces — **no** photographic hero imagery in-app. Decorative banners on study-space/group cards use subtle, subject-tinted **constellation/network motifs** (faint dotted graphs) and soft radial glows. No heavy gradients on full backgrounds; gradient is reserved for brand moments (wordmark, CTAs, progress).
- **Cards:** `--surface-1` (#12151E) fill, **1px `--border` (#262C3B) hairline**, **14px radius** (`--radius-lg`), soft `--shadow-sm`. Interactive cards lift 2px and brighten their border on hover. Featured cards get a violet glow instead of a heavier shadow.
- **Elevation:** on near-black, depth reads through **surface lightness** more than shadow. The ladder is sunken → base → surface-1 (card) → surface-2 (nested/raised) → surface-3 (hover) → surface-4 (pressed). Shadows are deep & soft (40–62% black). The signature "lift" is a **violet glow** (`--glow-violet`) on primary buttons and selected items.
- **Borders & hairlines:** thin, low-contrast (`--border-subtle` for internal dividers, `--border` for card edges, `--border-strong` on hover). Violet-tinted border (`--border-violet`) marks active nav and the current-user row.
- **Corner radii:** 8px chips/badges (badges use 6px `--radius-xs`), 10px inputs/buttons, 14px cards, 18px large panels, pill (999px) for filter chips and toggles. Avatars and status dots are full circles.
- **Transparency & blur:** the sticky top bar uses a translucent canvas + `backdrop-filter: blur(14px)`. Tinted accent backgrounds use low-alpha color washes (`rgba(139,92,246,0.12–0.18)`) for soft chips, active rows, and the upgrade card.
- **Imagery vibe:** cool, dark, techy. Where imagery appears it's tinted to the subject color over a dark base. Avatars are full-color photos in circular frames; the current user gets a violet ring, verified users a blue check.
- **Motion:** quick and crisp. Durations 140–320ms; default ease `cubic-bezier(.16,1,.3,1)` (gentle overshoot-free out), with a `--ease-spring` reserved for toggles. Hover = lift + brighten/glow; **press = translateY(1px) + slight scale-down (0.98)**. Progress rings/bars animate their fill on mount. No infinite/looping decorative animation in content.
- **Hover states:** ghost controls fill to `--surface-2/3` and brighten text; primary buttons brighten 8% and intensify the glow; cards lift. **Press states:** translate down + scale 0.98 (buttons), scale 0.92 (icon buttons).
- **Layout:** fixed **240px left sidebar** (workspace nav + AI tools + upgrade card + user), a **sticky translucent top bar** with global search and contextual actions, then a scrolling content area. Dashboards use a 2/3 + 1/3 split with a right rail of widgets. Generous 14–16px gaps on a 4px grid.

---

## Iconography

- **System:** **Lucide** line icons (1.5–2px stroke, rounded caps/joins) — the closest open match to the product's outline icon set. Loaded from CDN (`lucide@0.460.0`). In the UI kit, icons render via a small `<Icon name="…"/>` wrapper that emits `<i data-lucide>` and is hydrated by `lucide.createIcons()`.
  - ⚠️ **Substitution flag:** no original icon font/SVG set was provided; Lucide is a stand-in chosen for matching stroke weight and rounded geometry. Swap to the real set if available.
- **Style:** monochrome line icons, inheriting `currentColor`. On colored chips they sit on a low-alpha tinted square (`--radius-md`) in the subject/semantic color.
- **Common icons:** `graduation-cap` (Learn), `library`, `compass` (Explore), `users` (Groups), `bar-chart-3` (Analytics), `sparkles` (Tempo AI), `file-check-2` (Exam Generator), `clock`, `layers` (flashcards), `file-text` (notes/PDF), `target` (mastery), `flame` (streak), `crown` (Pro), `badge-check` (verified), `search`, `bell`, `upload`, `chevron-down`, `more-vertical`, `star` (favorite).
- **Emoji:** only motivational (🔥 streak). Never functional.
- **Logo:** `assets/logo.png` — the app mark (white book + flag/leaf line art on a `#2563EB`-family blue rounded square). Pair with the gradient "TEMPO" wordmark (`.tempo-wordmark` helper) on dark; on light, the wordmark falls back to indigo-600.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this). Imports-only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front-matter for download/Claude Code use.
- `assets/logo.png` — app mark.

**Tokens** (`tokens/`, all `@import`ed by `styles.css`)
- `fonts.css` — Google Fonts (Space Grotesk · Plus Jakarta Sans · JetBrains Mono). *Substituted — originals not provided.*
- `colors.css` · `typography.css` · `spacing.css` · `effects.css` · `base.css`

**Components** (`components/`, `window.TempoDesignSystem_e112f2`)
- `forms/` — **Button**, **IconButton**, **Input**, **Switch**
- `display/` — **Card**, **Badge**, **Avatar**, **AvatarGroup**
- `data/` — **StatTile**, **ProgressRing**, **ProgressBar**
- `navigation/` — **Tabs**, **Chip**, **NavItem**

**Foundation cards** (`guidelines/*.card.html`) — Colors, Type, Spacing, Brand specimens shown in the Design System tab.

**UI kit** (`ui_kits/tempo-app/`)
- `index.html` — interactive shell; click the sidebar to switch screens.
- Screens: `AnalyticsScreen`, `LibraryScreen`, `ExploreScreen`, `GroupsScreen` (+ `Sidebar`, `TopBar`, `helpers`, `data`, `App`).

---

## Using the system

Link the stylesheet and read components off the namespace:

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script>
  const { Button, Card, StatTile, ProgressRing } = window.TempoDesignSystem_e112f2;
</script>
```

Color comes from tokens — reference `var(--accent)`, `var(--surface-card)`, `var(--text-primary)`, etc. rather than hardcoding hexes.
