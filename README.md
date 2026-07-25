# vishalbagi.github.io

Personal portfolio for **Vishal Bagi** — Engineering Manager, Platform & Developer Experience.
Live at <https://vishalbagi.github.io/>.

## What this is

A dependency-free static site: one HTML page, one stylesheet, one script. No build step,
no package manager, no CI. GitHub Pages serves the default branch as-is, so whatever is
committed is what ships.

```
index.html              the whole site — five tab panels (About, Resume, SkillSet, Certification, Contact)
404.html                custom not-found page
robots.txt              crawler policy
sitemap.xml             single-URL sitemap
assets/css/style.css    all styling; mobile-first, breakpoints at 450 / 580 / 768 / 1024 / 1250px
assets/js/script.js     tab routing, skill filtering, contact form
assets/images/          avatar, service icons, brand logos, certification badges
```

## How it works

**Tabs.** The five `<article data-page="…">` panels are all in the DOM; `script.js` toggles
an `.active` class. Selection is keyed off `data-nav-link` / `data-page` values rather than
button text, so labels can be reworded freely. The active tab is mirrored into
`location.hash`, so `#resume` and friends are shareable and survive a reload.

**SkillSet filter.** Tiles carry `data-category`; the desktop button row carries
`data-filter-btn` and the mobile dropdown carries `data-select-item`. All three use the same
lowercase category tokens — if you add a tile, its `data-category` must match an existing
filter value exactly or it will only ever appear under "All".

**Contact form.** Posts to a Google Form endpoint targeting a hidden iframe, so the page
never navigates. The submit button stays disabled until `checkValidity()` passes, and the
confirmation message is driven by the iframe's `load` event — which is also the only safe
moment to reset the fields.

## Working on it

There is nothing to install. Serve the directory and open it:

```sh
python3 -m http.server 8000
```

Brand logos in `assets/images/` come from [simple-icons](https://simpleicons.org) (CC0), with
a `fill` applied so they stay legible against the dark palette. To add one, drop the SVG in,
set a fill, and add a tile to the `.project-list` in `index.html`.
