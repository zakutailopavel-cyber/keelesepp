# Design tokens (CRM, `crm-v2`)

All tokens live in **one** `:root` block at the top of `crm-v2/src/styles/index.css`.
Feature CSS should use these variables instead of raw hex / px values. Do not add a second `:root` block
for colours; component-local variables (e.g. `--lr-pad`, `--st-shadow`) are fine in their own scope.

## Tokens

| Group | Tokens | Notes |
|---|---|---|
| Colour | `--navy` `#132238`, `--navy-soft` `#1d314d`, `--green` `#087e6b`, `--green-dark` `#056454`, `--green-soft` `#e8f6f2`, `--amber` `#e7a93f`, `--ink` `#17253a`, `--muted` `#627087`, `--surface` `#fff`, `--surface-soft` `#f6f8fb`, `--border` `#dfe5ec`, `--danger` `#b42318` | `--green` is the only brand green. The old green `#226b5a` is gone. |
| Tints | `color-mix(in srgb, var(--green) 25%, transparent)` | Use `color-mix` for alpha tints of a token instead of a hand-written `rgba()`. |
| Radius | `--radius-sm` 8px, `--radius-md` 10px, `--radius-lg` 12px, `--radius-xl` 16px, `--radius-pill` 999px | The five most used values (≈ 210 × 12px, 182 × 10px, 149 × 999px, 120 × 8px, 57 × 16px). |
| Elevation | `--shadow-sm`, `--shadow-md`, `--shadow-lg` (`--shadow` = `--shadow-lg`) | `--shadow-md` is new; `--shadow-sm` / `--shadow` keep their old values. |
| Spacing | `--space-1..6` = 4 / 8 / 12 / 16 / 24 / 32 px | For new code. |
| Interaction | `--focus-ring`, `--ease-out` | From „Polish 1” (#1133). |

## Scoped palettes (careful)

- `availabilityPoll.css` (`.poll-page`, `.poll-grid`) defines its own `--ink`, `--muted`, `--g`, `--line`, `--bg`.
  Inside that scope `var(--ink)` / `var(--muted)` are **not** the app values, so literal `#17253a` / `#627087`
  were deliberately not swapped for variables anywhere in pass 1.
- `var()` does not work inside `url("data:image/svg+xml,…")`; keep literal colours there.

## Pass 1 (agent/design-tokens-1, 2026-11-09)

- Merged the two `:root` blocks (and the Polish 1 one) into one; the effective (second-block) values were kept, so nothing changed visually.
- Old green → current green (the only visual change): 9 spots in `index.css`, `fieldHelp.css`, `lessonRecording.css`
  (focus outlines of buttons/inputs/textarea/field help, teacher/conversation avatar gradient, visual worksheet control border).
- 1:1 swaps of `#087e6b`, `#056454`, `#e8f6f2`, `#132238`, `#dfe5ec`, `#f6f8fb` for their variables in feature CSS
  (101 replacements, 15 files). `availabilityPoll.css`, `:root` and `url()` strings were skipped.

## Pass 2 (agent/design-tokens-2, 2026-11-09) — radius and shadow, no visual change

Scope: every `crm-v2/src/**/*.css` except `features/worksheet-generator/`, `features/worksheet-studio/` (sheet / print
styles, checked by the CI `sheet-layout` job) and anything textbook. Only `border-radius` / `border-*-radius`
declarations were touched; the `:root` block and component-local custom properties (`--tb-r`, `--radius`, …) were not.

- **643 radius values in 92 files** → `var(--radius-*)`:
  - exact: 183 × 12px → `lg`, 144 × 10px → `md`, 125 × 999px → `pill`, 74 × 8px → `sm`, 57 × 16px → `xl` (583);
  - ±1px: 19 × 13px → `lg`, 17 × 15px → `xl`, 8 × 7px → `sm`, 3 × 17px → `xl` (47);
  - 13 × 99px → `pill` (all are progress bars / chips under 20px tall, so 99px and 999px draw the same).
  - Multi-corner values are swapped per corner (`var(--radius-lg) var(--radius-lg) 0 0`); values with `/` or `calc()` were skipped.
- **1 shadow** → token: `studentHome.css` `.sh-pet:hover` `0 8px 22px rgba(16,35,57,.08)` → `var(--shadow-md)` (2px blur difference).
- All CSS is loaded after `styles/index.css` (`main.jsx`, the lab entries), so the variables always resolve. No scope redefines `--radius-*`.

Left on purpose (not equal and not ±1px from a step):

- radius: 14px (122, two px from 12 and 16 — needs a screen-by-screen choice), 9px (44) and 11px (26) (exactly between two
  steps), 50% (51, circles), 18/20/22/24/30px (cards and hero blocks), 2–6px (small chips, inputs), `0`, `inherit`.
- shadows: no other hand-written `box-shadow` has the colour and geometry of a token. They use other colours
  (`rgba(15,23,42,…)`, `rgba(16,47,66,…)`, `rgba(36,41,74,…)`, green/amber glows), other offsets, or are focus rings and
  borders-as-shadow. Folding them is a visible change and belongs in a reviewed design pass.

## Next passes

1. Radius: decide 14px (→ 12 or 16) and 9 / 11px per screen; consider `--radius-2xl` 20px for cards.
2. Shadows: pick the 3–4 hand-written shadow families (menus/popovers, cards hover, toasts, modals) and either map them to `--shadow-sm/md/lg` with a visual check or add named tokens.
3. Colour: `rgba(8,126,107,x)` → `color-mix(in srgb, var(--green) x%, transparent)`; `#b42318` → `var(--danger)`; `#17253a` / `#627087` → `--ink` / `--muted` outside the poll scope; greys and tints (`#f1faf7`, `#0b5c4d`, …) into named tokens.
4. Dark mode later: only after (1)–(3), add `@media (prefers-color-scheme: dark)` / `[data-theme=dark]` overrides of the `:root` tokens. Raw hex left in feature CSS will not follow the theme, so the colour pass has to come first.
