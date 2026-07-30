import type { CollectionEntry } from 'astro:content';

/** `30 July 2026` — unambiguous, and matches Indian convention. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** `Jul 2026` — for dense lists where the day adds nothing. */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** ISO date for <time datetime> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * 200 wpm is the usual reading-speed constant, but technical prose with math
 * and code runs slower — 180 gives an estimate that doesn't feel optimistic.
 */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

/** Drafts never ship; `import.meta.env.DEV` keeps them visible while writing. */
export function isPublished<T extends { data: { draft?: boolean } }>(entry: T): boolean {
  return import.meta.env.DEV || entry.data.draft !== true;
}

export function byDateDesc<T extends { data: { date: Date } }>(a: T, b: T): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

/** Explicit `order` wins; date breaks ties. Used by projects and learning. */
export function byOrderThenDate<T extends { data: { order: number; date?: Date } }>(
  a: T,
  b: T,
): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0);
}

/** Tag counts across a set of entries, most-used first. */
export function collectTags<T extends { data: { tags?: string[] } }>(
  entries: T[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Related posts by shared-tag overlap, with recency as the tie-breaker.
 * Deliberately simple: with a few dozen posts, a similarity index would be
 * more machinery than the problem deserves.
 */
export function relatedPosts(
  current: CollectionEntry<'blog'>,
  all: CollectionEntry<'blog'>[],
  limit = 3,
): CollectionEntry<'blog'>[] {
  const currentTags = new Set(current.data.tags);
  return all
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const shared = post.data.tags.filter((t) => currentTags.has(t)).length;
      const sameTopic = post.data.topic && post.data.topic === current.data.topic ? 1 : 0;
      return { post, score: shared * 2 + sameTopic };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byDateDesc(a.post, b.post))
    .slice(0, limit)
    .map(({ post }) => post);
}

/** Absolute URL for canonicals, OG tags and RSS. */
export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).toString();
}
