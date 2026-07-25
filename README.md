# vishalbagi.github.io

Personal portfolio for **Vishal Bagi** — Engineering Manager, Platform & Developer Experience.
Live at <https://vishalbagi.github.io/>.

## What this is

A dependency-free static site: one HTML page, one stylesheet, one script, two fonts.
No build step, no package manager, no framework runtime. GitHub Pages serves the default
branch as-is, so whatever is committed is what ships.

```
index.html              the whole site — hero, impact, about, experience, skills,
                        certifications, contact, footer
404.html                custom not-found page, built from the same tokens
robots.txt              crawler policy
sitemap.xml             single-URL sitemap
assets/css/style.css    design tokens + all components (18 numbered sections)
assets/js/script.js     theme, scroll-spy, nav, reveals, counters, filters, form
assets/fonts/           Inter + JetBrains Mono, latin subsets, self-hosted
assets/images/          portrait, OG card, brand logos, certification badges
```

The only third-party request the page makes is Google Analytics. Fonts are self-hosted and
icons are an inline SVG sprite, so there is no CDN on the critical path.

## Design system

Everything visual is driven by custom properties at the top of `style.css`. Components
reference tokens and never raw values — change a token and the whole site follows.

| Group | Tokens |
| --- | --- |
| Colour | `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-2`, `--on-accent` |
| Type | `--ff-sans`, `--ff-mono`, `--step--2` … `--step-6` (fluid, `clamp()`-based) |
| Space | `--space-1` … `--space-20` on a 4px base, plus `--section-y`, `--gutter`, `--container` |
| Shape | `--r-sm`, `--r-md`, `--r-lg`, `--r-full` |
| Depth | `--shadow-1` … `--shadow-3` |
| Motion | `--dur-fast`, `--dur-base`, `--dur-slow`, `--ease-out` |

**Themes.** Dark is the default `:root` set. Light is defined twice — once under
`@media (prefers-color-scheme: light)` scoped to `:root:not([data-theme])`, and once under
`:root[data-theme="light"]` for an explicit choice. An inline script in `<head>` applies
the stored preference before first paint so there is no flash of the wrong palette.

**Type scale.** Fluid via `clamp()`, so there are no per-breakpoint font-size overrides
anywhere. Layout breakpoints are `34em`, `40em`, `48em`, `56em`, `62em`, `64em`.

**Motion.** Reveal and micro-interaction rules live inside
`@media (prefers-reduced-motion: no-preference)` — motion is opt-in rather than applied and
then cancelled. Scroll reveals are additionally scoped to `.js` (a class the inline script
adds) so the page is fully visible if JavaScript never runs.

## How it works

**Navigation.** One scrolling page with a sticky header. `script.js` tracks scroll position
and sets `aria-current="true"` on the matching link. Below `48em` the nav becomes a
full-screen overlay with a focus trap, `Esc` to close, and `inert` on the content behind it.
Old tab-era hashes (`#resume`, `#skillset`, `#certification`) are mapped to the new section
ids on load so previously shared links still work.

**Skill filters.** Tiles carry `data-category`; the buttons carry `data-filter`. Both use
the same lowercase tokens — if you add a tile, its `data-category` must match an existing
filter value exactly or it will only ever show under "All". Filtering toggles the `hidden`
attribute, so hidden tiles leave the accessibility tree too, and the result count is
announced through a `role="status"` region.

**Counters.** The final values are in the markup. JavaScript animates up to them on first
view; with reduced motion or no JS the numbers are simply correct and static.

**Contact form.** Posts to a Google Form endpoint targeting a hidden iframe, so the page
never navigates. Success is the iframe's `load` event — which is also the only safe moment
to reset the fields, since resetting inside the submit handler would clear them before the
browser had serialised the values. A 12-second timeout surfaces a failure path with a
fallback email address.

## Working on it

There is nothing to install:

```sh
python3 -m http.server 8000
```

**Adding a skill tile** — drop the logo in `assets/images/`, then add an `<li class="skill">`
with a `data-category` matching one of the filter buttons.

**Adding a certification** — add an `<li class="cert">` with the badge, category, `<time>`
and title. Badges sit on a neutral plate with `object-fit: contain`, so any aspect ratio is
safe.

**Icons** live in the inline `<svg class="sprite">` at the top of `<body>` and are referenced
with `<use href="#i-name">`. They inherit `currentColor`. To add one, append a `<symbol>`
with a `24×24` viewBox.

Brand logos come from [simple-icons](https://simpleicons.org) (CC0), with a `fill` applied so
they stay legible on both themes. Fonts are Inter and JetBrains Mono (SIL Open Font License).
