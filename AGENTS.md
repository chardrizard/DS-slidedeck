# AGENTS.md — Design System Interview Slidedeck

## What this project is

A self-contained HTML interview presentation. Single `index.html` file, no build tools, no npm, no framework. Deployed as a static site on GitHub Pages.

The deck covers two case studies (Aeon Design System at Aegon, Hypotheek team adoption) plus a feature deep-dive and contact slide. Slide count is fluid; currently 31 slides.

## File structure

```
/
├── index.html          — the entire app: slides, styles, and JS in one file
└── images/
    ├── personal/       — about slide photos (Skiing.png, Landscape_01.png, etc.)
    ├── cs1-aeon/       — Case Study 1 images (AIP_old_2.0.png, AIP_uplift_AEON_02.png, etc.)
    ├── cs2-hypotheek/  — Case Study 2 images
    └── before/         — Flip card "before" screenshots (buttons.png, input.png, etc.)
```

## How to run

Open `index.html` directly in a browser. No server needed for most things. If images don't load locally due to CORS, use:

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Slide structure (current: 31 slides)

| Section | Slides | Content |
|---|---|---|
| Intro | 01–03 | Title, About, Contents nav |
| CS1 — Aeon | 04–15 | DS overview, before/after slider, flip cards (live components), architecture, docs, documentation bento, illustration system slides, metrics, reflection |
| CS2 — Hypotheek | 16–28 | Resistance story, reframe, composable table, outcomes |
| Features | 29–30 | WCAG deep-dive, side projects |
| Close | 31 | Contact |

## Slide maintenance norm

Slides are actively moved, added, and removed during iteration. After any slide structure change:

- Keep DOM order, `data-index`, and visible deck order aligned.
- Do not rely on fixed section offsets when avoidable; section navigation should derive from `data-section`.
- Update contents-card jumps with section-based targets, not hardcoded slide numbers.
- Re-run a quick audit: total slide count, duplicate ids, `data-index` sequence, section counts, and browser console errors.
- Update this file if the section ranges or total slide count materially change.

## Design tokens (DO NOT change without asking)

```css
--ink: #0f0f0f
--paper: #f4f3ef        /* light slides */
--dark: #111111         /* dark slides */
--accent: #f59e0b       /* amber — primary accent */
--accent-2: #3b82f6     /* blue — secondary */
--mono: 'DM Mono'
--sans: 'DM Sans'
--slide-w: 1440px
--slide-h: 810px
```

## Notable interactive elements

- **Slide 05** — before/after drag slider (AIP old vs new). Has `data-no-advance="true"`.
- **Slide 08** — flip cards with live interactive Aeon components on the back: buttons, text fields with IBAN/postcode validation, dropdown (single/multi/filterable), badges, checkboxes, radio buttons. Has `data-no-advance="true"`.
- **Nav** — tab bar jumps between sections, dot bar shows position, keyboard arrows navigate, speaker notes toggle (📝 button)

## Aeon component tokens (flip card backs)

```css
--aeon-blue: #1B75BB
--aeon-blue-h: #15609E    /* hover */
--aeon-blue-a: #115180    /* active */
--aeon-blue-dis: #8BBAD8  /* disabled */
--aeon-err: #e53935
```

## Rules

- Everything lives in `index.html` — do not split into separate CSS or JS files
- No npm, no build step, no framework
- Images load via relative paths from `images/` — do not restructure the folder
- Adding, removing, and moving slides is normal when requested. Keep slide navigation and documentation in sync after structural changes.
- The Aeon components in flip card backs must remain functional
- `data-no-advance="true"` on slides 05 and 08 must stay — it prevents click-to-advance on interactive slides

## Common tasks

**Update text:** Find the slide by id (`#slide-17` etc.) and edit inline. All content is in the HTML.

**Swap an image:** Replace the file in the relevant `images/` subfolder with the same filename, or update the `src` attribute in the slide.

**Add a speaker note:** Add `<div class="speaker-note">your note</div>` inside the slide's `<section>`. Visible only when the notes toggle is active.

**Change a metric:** Find `.metric-value` inside the relevant slide and update the text.

## What still needs real images

Some slides still use `.img-placeholder` divs where final screenshots are pending. Check `index.html` for the current placeholders before presenting.
