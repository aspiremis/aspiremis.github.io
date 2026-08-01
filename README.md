# aspiremis.github.io

My open engineering notebook — coursework, simulations, notes and projects from
my M.Tech in Power Systems Engineering at IIT Bhubaneswar.

**Live at [aspiremis.github.io](https://aspiremis.github.io)**

Built to grow over two years. It is deliberately not a résumé: the useful part of
learning something is the confusion and the wrong turns, and none of that
survives being compressed into a CV bullet.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | [Astro 7](https://astro.build) | Static output, zero JS by default |
| Language | TypeScript (strict) | Content schemas catch frontmatter typos at build time |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) | CSS-first config, semantic design tokens |
| Content | Markdown + MDX via Content Collections | Everything is a file you can edit in any editor |
| Math | KaTeX (`remark-math` + `rehype-katex`) | Rendered at build time — no math library ships to the browser |
| Code | Shiki, dual theme | One render serves light and dark, no client JS |
| Search | [Pagefind](https://pagefind.app) | Full-text search on a static host |
| Feeds | `@astrojs/rss`, `@astrojs/sitemap` | |
| Hosting | GitHub Pages via GitHub Actions | |

**No React, no Framer Motion.** Both were considered and rejected: pulling a
framework runtime into an Astro site for a handful of animations is the single
biggest threat to the performance budget. Animation is CSS transitions plus one
small `IntersectionObserver`, and it honours `prefers-reduced-motion`.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:4321
```

| Command | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/`, then Pagefind indexing |
| `npm run preview` | Serve the production build locally |
| `npm run check` | TypeScript + Astro diagnostics |
| `npm run assets` | Regenerate the favicon PNGs and OG card |

> Full-text search only works after `npm run build`, because Pagefind indexes the
> built HTML. In `npm run dev` the ⌘K palette silently falls back to searching
> titles and descriptions — that's expected, not a bug.

---

## Adding content

Everything lives in `src/content/`. Two shapes, split on one rule:

- **Anything with a body to read** is a markdown file in a folder.
- **Anything that is a pure record** (a resource, a publication) is one entry in
  a JSON list — appending is one object, not a new file.

Every field is validated against a schema in `src/content.config.ts`. A typo in
frontmatter **fails the build** rather than silently rendering an empty page.

### A blog post

Create `src/content/blog/my-post.md`:

```markdown
---
title: Why the Jacobian Is Structured That Way
description: One sentence that will appear in listings, search and social cards.
date: 2026-08-14
tags: ['load-flow', 'numerical-methods']
topic: power-systems      # optional, must be a slug from TOPICS in consts.ts
featured: false           # true surfaces it on the home page
draft: false              # true hides it from the build but shows in dev
---

Your writing. Math works inline as $V_i \angle \delta_i$ and as display blocks:

$$
Y_{ii} = y_{i0} + \sum_{k \neq i} y_{ik}
$$

Code blocks get syntax highlighting in both themes automatically.
```

The URL is the filename: `/blog/my-post`.

### A note

Same idea in `src/content/notes/`, with two differences: `topic` is **required**,
and `status` marks how settled the note is.

```yaml
topic: power-quality
status: seedling      # seedling | growing | evergreen
```

Seedling notes are meant to be published while still rough — that's the point of
having the field. Link between notes with `[[note-filename]]`.

### A project

`src/content/projects/my-project.md`. The body should follow the case-study
structure the existing three use: Overview, Problem statement, Architecture,
Implementation, Results, Future improvements.

```yaml
title: PV Hosting Capacity Toolkit
summary: One or two sentences for the card.
date: 2026-07-20
status: active            # active | completed | planned
tech: ['Python', 'OpenDSS']
tags: ['hosting-capacity']
github: https://github.com/aspiremis/pv-hosting-capacity
featured: true
order: 2                  # lower sorts first
```

### A semester

`src/content/journey/semester-N.md`. Courses, labs, books and achievements live
in frontmatter so they can be rendered as tables and counted; the body holds the
reflection that makes the page worth reading.

⚠️ **The course codes in Semesters 1–4 are placeholders.** Replace `EE6101`,
`EE6103` and the rest with your actual codes, credits and instructors as you get
them.

### A Learning Hub lesson

The Hub is three levels: **track → module → lesson**. Modules group lessons
visually but don't appear in URLs, so they can be reorganised without breaking
links.

- **Tracks** — `src/content/tracks/matlab.md`. Metadata plus an intro essay.
- **Modules** — `src/content/modules.json`. One object each; no body.
- **Lessons** — `src/content/lessons/<track>/<slug>.mdx` → `/learning/<track>/<slug>`.

Lesson filenames carry **no numeric prefix**. Ordering comes from `order`, so a
lesson can move within its module without changing its URL.

```yaml
---
title: Element-wise vs Matrix Operations
track: matlab
module: foundations                   # matches a `slug` in modules.json
order: 7
description: One sentence for the lesson list and search.
objectives:                           # rendered above the lesson body
  - Choose correctly between * and .*
prerequisites: [matrices, indexing]   # lesson slugs, auto-linked
estimatedMinutes: 30
difficulty: beginner                  # beginner | intermediate | advanced
toolboxes: []                         # e.g. ['Symbolic Math'] — badged on the lesson
tags: ['matlab']
---
```

Body sections follow a fixed order: **Intuition → Theory → Implementation →
Visualisation → Common Mistakes → Mini Tasks → Reflection → Further Reading.**

These components work in any lesson with **no import statement** — the route
injects them, so lessons stay clean prose:

`<Analogy>` · `<KeyIdea>` · `<Callout type="tip|warning|engineering|note">` ·
`<CodeFile name="x.m">` · `<Exercise n={1} kind="predict">` · `<Solution>` ·
`<Quiz questions={[…]}>` · `<Compare rows={[…]}>`

Wrapping a code block in `<CodeFile name="per_unit.m">` adds a filename header and
a download button. The downloaded file is built client-side from the rendered
text, so there is never a second copy on disk to drift out of sync with the lesson.

**Progress tracking** lives in `localStorage` under `learn-progress:v1` and is
applied by `ProgressStore.astro`. Pages render at 0% and hydrate, so CLS stays at
zero and the Hub is fully readable with JavaScript off — you just don't get ticks.
It is per-browser by design; the hub's Progress panel exports and imports JSON.

### A paper you've read

`src/content/papers/`. The `takeaway` field is the point — a reading list without
takeaways is just a list.

### Resources and publications

`src/content/resources.json` and `src/content/publications.json`. Append an
object; every field is validated.

`publications.json` is currently `[]`, so `/research` renders a designed empty
state. Astro logs *"The collection publications does not exist or is empty"*
during the build — that warning is expected until the first entry is added.

---

## Project layout

```
src/
├── consts.ts              Identity, navigation, topic taxonomy — edit here first
├── content.config.ts      Schemas for every collection
├── content/               All the writing
│   ├── tracks/            Learning Hub tracks
│   ├── modules.json       Learning Hub modules
│   └── lessons/           Learning Hub lessons (MDX)
├── components/
│   └── learning/          Hub-specific: callouts, quizzes, progress, icons
├── layouts/
│   ├── BaseLayout.astro   Shell: head, theme, nav, footer, palette
│   └── ArticleLayout.astro Long-form: prose, ToC, reading progress
├── lib/
│   ├── utils.ts           Dates, reading time, related posts, tags
│   └── github.ts          Build-time GitHub API — fails soft
├── pages/                 File-based routes
└── styles/global.css      Design tokens and prose styling
scripts/generate-assets.mjs  Favicon PNGs + OG card, generated from SVG
```

### Where to change things

| To change | Edit |
|---|---|
| Name, email, links, "currently" line | `src/consts.ts` |
| Navigation structure | `NAV` in `src/consts.ts` |
| Learning topics | `TOPICS` in `src/consts.ts` |
| Colours, fonts, spacing | `:root` / `.dark` in `src/styles/global.css` |
| Research interests, future work | arrays at the top of `src/pages/research.astro` |
| Tooling list, timeline | arrays at the top of `src/pages/about.astro` |

The accent colour is one variable. Changing `--accent` (and its four companions)
in `global.css` re-themes the entire site.

---

## How the GitHub data works

The contribution calendar and repository list are **fetched at build time**, not
in the browser — a static site can't call an authenticated API without leaking a
token and paying a request on every page view.

The workflow rebuilds nightly (`cron: '0 21 * * *'`, 02:30 IST) so the data stays
fresh between content pushes.

Both fetches fail soft. If GitHub is down, rate-limits, or no token is present,
the components render a link to the profile instead and the build still succeeds.
Locally you'll always see the fallback unless you export a `GITHUB_TOKEN`.

---

## Performance, SEO and accessibility

### Measured Lighthouse scores

Run against `npm run build && npm run preview`.

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop, all pages | **99–100** | **100** | **100** | **100** |
| Mobile, most pages | **97–98** | **100** | **100** | **100** |
| Mobile, math-heavy articles | **93** | **100** | **100** | **100** |

CLS is **0** and Total Blocking Time is **0 ms** everywhere.

Two honest notes:

- **Math-heavy pages score 93 on mobile, not 95+.** Those pages load KaTeX's
  stylesheet (7.8 kB gzipped) and two KaTeX font files (~42 kB) on top of the
  body fonts. Under Lighthouse's simulated slow-4G that pushes First Contentful
  Paint to ~2.4 s. It is the genuine cost of typeset math, and the alternatives
  — loading the math CSS asynchronously, or hand-trimming KaTeX's twelve font
  families — either flash unstyled math or break silently the first time a new
  LaTeX command is used. Pages without math are unaffected, because the KaTeX
  stylesheet is scoped to the pages that render markdown (`MathStyles.astro`).
- **`/404` scores 66 on SEO by design.** It sets `noindex`, and Lighthouse
  penalises exactly that. A 404 page should not be indexed.

**How that's achieved**
- Zero framework runtime. Total JS is ~9 kB of hand-written TypeScript.
- Fonts self-hosted, latin subset only, with just Inter preloaded — it renders
  the LCP element, and preloading the other three would contend for the same
  connection without helping paint.
- Syntax highlighting and math rendered at build time.
- Theme resolved by one inline blocking script, so there's no flash on reload.
- Scroll progress uses a scroll-driven CSS animation where supported (off the
  main thread), falling back to a throttled listener.

**SEO**
- Per-page canonical URLs, OpenGraph and Twitter cards.
- JSON-LD `Person` on every page, plus `Article` on posts and notes.
- `sitemap-index.xml`, `robots.txt`, and an RSS feed covering posts *and* notes.

**Accessibility**
- Semantic landmarks, one `h1` per page, skip-to-content link.
- Nav dropdowns open on hover **and** `focus-within` — keyboard reachable with no
  JavaScript.
- Command palette is a real `<dialog>`: focus trapping and Escape come free.
- Visible focus ring everywhere; `prefers-reduced-motion` fully respected.
- Contribution calendar exposed as a single labelled image rather than 365
  unlabelled cells.

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## Future enhancements

Ideas, roughly in order of value:

1. **Series support** — group multi-part posts with prev/next navigation.
2. **Per-page OG images** — generate a card per post with the title on it, via
   an Astro endpoint using the existing `sharp` dependency.
3. **Backlinks between notes** — `[[wikilinks]]` currently render as plain text.
   A remark plugin could resolve them into real links and build a backlink index.
4. **Interactive figures** — a small islands-based plot component for showing
   voltage profiles and convergence curves as live charts rather than images.
5. **Filter UI on `/notes`** — client-side topic and status filtering once there
   are more than ~30 notes.
6. **Webmentions or a comment layer** — only if there's an audience that wants it.
7. **`/uses` and `/now` pages** — cheap to add, and people genuinely read them.
8. **Bibliography management** — if the paper list grows past ~50, a BibTeX
   import beats hand-writing frontmatter.

---

## License

Code is MIT. Written content (posts, notes, project write-ups) is
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — reuse it with
attribution.
