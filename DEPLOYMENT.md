# Deployment guide

The site deploys itself. Push to `main`, and about ninety seconds later
[shalini-ee.github.io](https://shalini-ee.github.io) is updated.

This document covers the one-time setup, then everything you might need later.

---

## One-time setup

### 1. Authenticate as yourself

The `gh` CLI on this machine may be signed in as a different account. Check:

```bash
gh auth status
```

If it doesn't say `shalini-ee`, sign in:

```bash
gh auth login
```

Choose **GitHub.com → HTTPS → Login with a web browser**, and sign in as
`shalini-ee`. Both accounts can coexist; switch between them with:

```bash
gh auth switch
```

### 2. Confirm the committer identity

This repository sets your name and email **locally**, so commits are attributed
to you regardless of the machine's global git config:

```bash
git config user.name    # → Shalini Mishra
git config user.email   # → shalinimishra7068@gmail.com
```

If either is blank, set them:

```bash
git config user.name "Shalini Mishra"
git config user.email "shalinimishra7068@gmail.com"
```

> Use `git config`, not `git config --global`. The local setting is what keeps
> this repository's commits yours without touching anything else on the machine.

### 3. Create the repository and push

The repository **must** be named `shalini-ee.github.io` — GitHub only serves a
user site from a repository matching `<username>.github.io`, and that is what
puts the site at the domain root with no base-path configuration.

```bash
git add .
git commit -m "Initial commit: personal site and engineering notebook"
gh repo create shalini-ee.github.io --public --source=. --remote=origin --push
```

### 4. Turn on Pages

```bash
gh api -X POST repos/shalini-ee/shalini-ee.github.io/pages \
  -f 'build_type=workflow'
```

Or in the browser: **Settings → Pages → Build and deployment → Source →
GitHub Actions**.

This is the step people miss. Without it the workflow runs, builds successfully,
and deploys nothing.

### 5. Watch the first deploy

```bash
gh run watch
```

The site is live at **https://shalini-ee.github.io** once it finishes. The first
deploy can take a few extra minutes while GitHub provisions the domain.

---

## Everyday use

Publishing is a normal git push:

```bash
git add .
git commit -m "Add note on symmetrical components"
git push
```

Check on it with `gh run list --limit 3`, or in the Actions tab.

Before pushing something you care about:

```bash
npm run check    # types and diagnostics
npm run build    # catches schema errors in new content
npm run preview  # look at it
```

A frontmatter typo fails the build rather than shipping a broken page, so
`npm run build` locally is the fastest way to catch it.

---

## What the workflow does

`.github/workflows/deploy.yml` runs on three triggers:

| Trigger | When | Why |
|---|---|---|
| `push` to `main` | You publish | The normal path |
| `schedule` | 21:00 UTC daily (02:30 IST) | Refreshes the GitHub contribution calendar and repo list, which are baked in at build time |
| `workflow_dispatch` | Manual button | Redeploy without a commit |

Steps: checkout → Node 22 → `npm ci` → `npm run build` → upload → deploy.

`npm run build` does three things in order:
1. `prebuild` regenerates the favicon PNGs and OG card from SVG via `sharp`
2. `astro build` produces static HTML into `dist/`
3. `pagefind --site dist` builds the full-text search index

`GITHUB_TOKEN` is passed to the build for the contribution calendar (GitHub's
GraphQL API requires authentication even for public data). It's the automatic
per-run token — you don't create or store anything. If it were missing, the
build still succeeds and the calendar renders a link-out instead.

---

## Troubleshooting

**The workflow succeeds but the site 404s**
Pages source isn't set to GitHub Actions. Redo step 4.

**`Permission denied` when pushing**
`gh` is authenticated as another account. `gh auth switch`, then retry. If git
itself cached the wrong credential, clear it with
`gh auth setup-git` and push again.

**Build fails on `astro build` with a content error**
A frontmatter field doesn't match its schema. The message names the file and the
field. Check it against the schema in `src/content.config.ts` — most often a date
that isn't `YYYY-MM-DD`, or a `topic` that isn't a slug listed in `TOPICS`.

**`The collection "publications" does not exist or is empty`**
Expected. `publications.json` is `[]` until you have a publication, and
`/research` renders a designed empty state in the meantime.

**The contribution calendar shows a fallback message on the live site**
The GraphQL call failed. Re-run the workflow; it's almost always transient. It
*always* shows the fallback locally, because you have no `GITHUB_TOKEN` exported.

**Search returns nothing**
Pagefind only indexes a production build. Run `npm run build && npm run preview`
rather than `npm run dev`.

**Old content still showing after a deploy**
GitHub Pages caches aggressively. Hard-reload (⌘⇧R). If it persists past a few
minutes, check that the run actually deployed rather than only building.

---

## Adding a custom domain later

If you ever buy a domain:

1. Add a `CNAME` file to `public/` containing just the domain, e.g.
   `shalinimishra.in`
2. Update `site` in `astro.config.mjs` and `SITE.url` in `src/consts.ts` — both
   feed canonical URLs, OG tags and the sitemap, so a stale value is an SEO bug
3. Update the `Sitemap:` line in `public/robots.txt`
4. Point DNS at GitHub:
   - `A` records for the apex → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - or a `CNAME` for `www` → `shalini-ee.github.io`
5. Settings → Pages → Custom domain, and tick **Enforce HTTPS**

---

## Rolling back

Deploys are just commits. To undo the last one:

```bash
git revert HEAD
git push
```

The workflow redeploys the previous state automatically.
