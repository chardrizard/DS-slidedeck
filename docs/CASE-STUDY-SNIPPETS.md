# Case Study Snippets — Reference

This file is a reference for building isolated case-study HTML files in
`case-studies/`. **Read this on demand.** It is not auto-loaded.

Each isolated case study is a full clone of `index.html` with only the
relevant slides retained. All CSS, fonts, JS, and nav come along — that's
the point. Slides are added/removed as `<section class="slide ...">` blocks
and the navigation logic re-derives sections from `data-section` attributes
at load time, so trimming slides "just works."

---

## Workflow for a new case study

1. **Duplicate the template:** `cp case-studies/_template.html case-studies/cs-{name}.html`
2. **Pick a section id** for `data-section`. Use a short slug like `cs-aeon`,
   `cs-banking`, `cs-onboarding`. The id is used by the nav and by the JS to
   group slides.
3. **Replace the placeholder title slide.** Keep the same `<section>` shape;
   change content inside.
4. **Add more slides** by copying snippet blocks from this doc (or from
   `cs-aeon.html` / `cs-hypotheek.html`). Each slide is a self-contained
   `<section class="slide ...">` block.
5. **Image paths use `../images/...`** because case-studies live one folder
   deep. The template already does this.
6. **Renumber `data-index`** sequentially (0, 1, 2, …). The first slide must
   carry `class="slide ... active"` for the initial render.
7. **Update the `<title>` and the single `nav-tab` button** at the top.

---

## Slide layout primitives

All slides are 1440 × 810 (`--slide-w`, `--slide-h`). Three background flavours:

| Class | Background | Use |
|---|---|---|
| `slide-dark` | `#111` | Hero, metrics, contact |
| `slide-light` | `#f4f3ef` | Default content |
| `slide-fullbleed` | image-driven | Edge-to-edge screenshots, before/after sliders |

Standard inner wrapper: `<div class="slide-inner">…</div>`. Two-column body uses
`flex-direction:row;gap:64px;padding:var(--pad);` with `<div class="col col-center" style="flex:0 0 30%;">` and
`<div class="col col-center" style="flex:0 0 70%;">`.

Eyebrow + title pattern:
```html
<div class="eyebrow">Section label</div>
<h2 class="section-title">Headline. <em>Italic continuation.</em></h2>
<p class="body-text">Body copy here.</p>
```

`eyebrow-accent` makes the eyebrow amber. `<em>` inside `section-title` is
light-weight italic — the deck's standard emphasis treatment.

---

## Interactive components — what to copy

When pulling a component into a new isolated file, copy the **slide markup**
listed below. The supporting CSS, fonts, and JS are already in the template
(they came from `index.html` verbatim) and don't need separate inclusion.

### Before/after image slider (drag to reveal)

- Reference: `index.html` slide-05 (`#ba-slider`), slide-22 (`#ba2-slider`),
  slide-22c (`#ba3-slider`)
- Slide must have `data-no-advance="true"` to prevent click-to-advance
  collision with drag.
- Each instance needs unique IDs (`ba-`, `ba2-`, `ba3-`, …). Add a fourth by
  cloning slide-22's block and changing every `ba2-` to `ba4-`. The JS at the
  bottom of `index.html` initialises sliders by id pattern — verify the init
  block covers your new id, or add a parallel init.

### Flip cards with live Aeon components

- Reference: `index.html` slide-08 — the entire 300-line block from
  `<section ... id="slide-08" ...>` to its `</section>`.
- Carries: button states, IBAN/postcode validators, dropdown (single +
  multi + filterable), checkboxes, radios, badges, the `interaction-toast`.
- All Aeon component CSS variables (`--aeon-blue`, `--aeon-err`, etc.) are
  in the `:root` block of the inherited `<style>`.
- Slide must have `data-no-advance="true"`.
- Keep the trailing `<div class="interaction-toast" id="slide-08-toast" ...>`
  if you keep the validators — it's where validation messages render.

### Metric cards with tooltips

- Reference: slide-14 (3-up), slide-24 (2-up grid override).
- Pattern: `metric-grid` → `metric-col` → `metric-kicker` + `metric-value` +
  `metric-label` + optional `metric-tooltip-wrap`.
- For 2-up: add inline `style="grid-template-columns:1fr 1fr;"` to
  `metric-grid`.

### Reflection timeline (what worked / what I'd change)

- Reference: slide-15.
- Two-column `reflection-timeline` with `reflection-tl-line` divider between
  columns. `amber` modifier = kept; `slate` modifier = changed.

### Swimlane (ownership/contract diagram)

- Reference: slide-20.
- Three-band layout (`amber` / `neutral` / `blue`) with `swim-chip` and
  `swim-chip-mono` pills. Useful any time you're showing API/contract
  boundaries between teams.

### Caption overlay on full-bleed images

- Reference: slide-09, slide-10, slide-12b, slide-12c, slide-22b.
- Add `<div class="caption-overlay">` inside a `slide-fullbleed` section.
  For darker overlays, override the gradient with inline
  `style="background:linear-gradient(...);padding:32px 72px;"`.

### FAQ accordion (used on contact slide)

- Reference: slide-27 — `#s27-faq` with `faq-item` children. JS toggles
  `.open` on click and rotates the chevron. Already wired up in the
  inherited script.

---

## When to add a new component

If you build a new interactive component during isolated case-study work:

1. Build it inside `case-studies/cs-{name}.html` first. Inline CSS in the
   `<style>` block, inline JS at the bottom.
2. Once you're happy and ready to merge into the main deck, copy the slide
   markup, the CSS additions, and the JS additions into `index.html` in the
   matching positions.
3. Add an entry here under "Interactive components" so future case studies
   can reuse it.

---

## What the inherited JS does (for reference)

The `<script>` block at the bottom of every case-study HTML:

- Reads `.slide` elements, derives `SECTIONS` from `data-section` values
  (filters out empty sections automatically — that's why trimming slides
  works without code changes).
- Wires keyboard navigation (← →, Space, Home, End), nav-tab clicks, dot
  bar, slide counter.
- Initialises before/after sliders, flip-card flips, validators, FAQ
  accordion, toast on every load.
- Skips click-to-advance on slides with `data-no-advance="true"`.

If you remove a slide that hosted an init target (e.g. you drop the
flip-card slide), the matching init block silently no-ops because
`document.getElementById(...)` returns `null`. No cleanup needed.

---

## Don't

- Don't split CSS or JS into separate files. The whole deck stays
  self-contained per HTML file.
- Don't change design tokens (`--ink`, `--paper`, `--accent`, etc.) in a
  case study. If you need a new token, add it to `index.html` first so
  everything stays in sync.
- Don't commit `case-studies/`. It's gitignored. These are sandbox files,
  not deployed artifacts. Plucking finished slides into `index.html` is the
  release path.
