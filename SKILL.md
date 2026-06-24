---
name: tempo-design
description: Use this skill to generate well-branded interfaces and assets for Tempo, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `styles.css` — link this once; it imports all tokens + fonts. Reference `var(--accent)`, `var(--surface-card)`, `var(--text-primary)`, `var(--grad-cta)`, etc.
- `tokens/` — colors, typography, spacing, effects, base reset.
- `components/` — React primitives (Button, IconButton, Input, Switch, Card, Badge, Avatar, AvatarGroup, StatTile, ProgressRing, ProgressBar, Tabs, Chip, NavItem). Load `_ds_bundle.js`, then `const { Button } = window.TempoDesignSystem_e112f2`.
- `ui_kits/tempo-app/` — full interactive study-app recreation (Analytics, Library, Explore, Groups). Best reference for layout, density, and composition.
- `guidelines/*.card.html` — foundation specimens (color, type, spacing, brand).
- `assets/logo.png` — app mark; pair with the `.tempo-wordmark` gradient helper.

## Brand in one breath
Dark blue-black canvas, single violet accent (`#8B5CF6`) with an indigo→violet brand gradient, Space Grotesk display + Plus Jakarta Sans UI + JetBrains Mono numerics, Lucide line icons, 14px hairline-bordered cards, violet-glow on primary actions, encouraging second-person metric-driven copy. ALL-CAPS status/level tags. Emoji only as motivational accents (🔥).

## Notes / caveats
- Fonts and icons are **substitutions** (Google Fonts + Lucide) — no originals were provided. Swap if the real assets surface.
- The system was built from screenshots only; reconcile against real code/Figma if available.
