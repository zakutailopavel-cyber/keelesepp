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

## Next passes

1. Radius: replace literal `8/10/12/16/999px` with `--radius-*` file by file; fold the odd values (9, 11, 13, 14, 15, 18, 20, 22px) into the nearest step, checking each screen.
2. Shadows: ~240 hand-written `box-shadow`s → `--shadow-sm/md/lg`; review each (borders-as-shadow and focus rings stay).
3. Colour: `rgba(8,126,107,x)` → `color-mix(in srgb, var(--green) x%, transparent)`; `#b42318` → `var(--danger)`; `#17253a` / `#627087` → `--ink` / `--muted` outside the poll scope; greys and tints (`#f1faf7`, `#0b5c4d`, …) into named tokens.
4. Dark mode later: only after (1)–(3), add `@media (prefers-color-scheme: dark)` / `[data-theme=dark]` overrides of the `:root` tokens. Raw hex left in feature CSS will not follow the theme, so the colour pass has to come first.
