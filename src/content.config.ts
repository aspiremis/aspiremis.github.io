import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
// Imported from `zod` directly rather than re-exported through `astro:content`,
// which Astro 7 deprecates.
import { z } from 'zod';
import { TOPICS } from './consts';

const topicSlugs = TOPICS.map((t) => t.slug) as [string, ...string[]];
const topic = z.enum(topicSlugs);

/**
 * Content model
 * -------------
 * Two shapes, split on a single rule:
 *   • Anything with a *body* to read is markdown under src/content/<name>/.
 *   • Anything that is a pure *record* (a resource, a publication) is one JSON
 *     list — appending an entry is one object, not a new file.
 * Everything below is validated at build time, so a typo in frontmatter fails
 * the build instead of silently rendering an empty page.
 */

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    topic: topic.optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/**
 * Notes are deliberately not blog posts: shorter, atomic, allowed to be
 * unfinished. `status` borrows the digital-garden convention so a half-formed
 * note can be published honestly rather than sitting in drafts forever.
 */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    topic: topic,
    tags: z.array(z.string()).default([]),
    status: z.enum(['seedling', 'growing', 'evergreen']).default('seedling'),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    status: z.enum(['active', 'completed', 'planned']),
    tech: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    github: z.url().optional(),
    demo: z.url().optional(),
    paper: z.url().optional(),
    featured: z.boolean().default(false),
    /** Lower sorts first on the index; ties fall back to date. */
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

/**
 * One entry per semester. Courses and milestones live in frontmatter so they
 * can be rendered as tables and counted, while the body holds the reflection
 * that makes the page worth reading.
 */
const journey = defineCollection({
  loader: glob({ base: './src/content/journey', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    semester: z.number().int().min(1).max(4),
    title: z.string(),
    period: z.string(),
    /** e.g. "Autumn 2026-27" — the institute's own session label. */
    session: z.string().optional(),
    status: z.enum(['completed', 'current', 'upcoming']),
    summary: z.string(),
    courses: z
      .array(
        z.object({
          /** Blank for a course that is planned but not yet registered. */
          code: z.string().optional(),
          name: z.string(),
          /**
           * Lecture-Tutorial-Practical hours per week, exactly as the institute
           * states it ("3-1-0"). Deliberately not converted to a credit count:
           * the L+T+P/2 rule varies between institutes, and guessing would put
           * an invented number next to real course data.
           */
          ltp: z
            .string()
            .regex(/^\d+-\d+-\d+$/, 'ltp must look like "3-1-0"')
            .optional(),
          type: z.enum(['Core', 'Core Lab', 'Elective', 'Seminar', 'Thesis']).optional(),
          instructor: z.string().optional(),
          note: z.string().optional(),
        }),
      )
      .default([]),
    labs: z.array(z.string()).default([]),
    highlights: z.array(z.string()).default([]),
    books: z
      .array(z.object({ title: z.string(), author: z.string() }))
      .default([]),
    conferences: z.array(z.string()).default([]),
    achievements: z.array(z.string()).default([]),
  }),
});

/** Papers read, with the takeaway that made them worth logging. */
const papers = defineCollection({
  loader: glob({ base: './src/content/papers', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number().int(),
    url: z.url().optional(),
    doi: z.string().optional(),
    readOn: z.coerce.date(),
    topic: topic,
    takeaway: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

/** A topic I am actively working through, with what I have covered so far. */
const learning = defineCollection({
  loader: glob({ base: './src/content/learning', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    topic: topic,
    description: z.string(),
    status: z.enum(['exploring', 'in-progress', 'consolidating', 'paused']),
    startedOn: z.coerce.date(),
    /** Rough self-assessed completeness, 0–100. Honest, not aspirational. */
    progress: z.number().min(0).max(100).default(0),
    order: z.number().default(99),
  }),
});

const resources = defineCollection({
  loader: file('./src/content/resources.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    kind: z.enum(['book', 'course', 'tool', 'dataset', 'reference', 'community']),
    author: z.string().optional(),
    url: z.url().optional(),
    description: z.string(),
    topics: z.array(topic).default([]),
    recommended: z.boolean().default(false),
  }),
});

/* ==========================================================================
   Learning Hub
   --------------------------------------------------------------------------
   Three levels: track → module → lesson.

   Modules group lessons visually but deliberately do NOT appear in URLs
   (/learning/matlab/variables, not /learning/matlab/foundations/variables).
   That keeps paths short and means modules can be reorganised later without
   breaking a single link.

   Lesson filenames carry no numeric prefix — ordering lives in `order`, so a
   lesson can be moved within its module without renaming the file and
   invalidating its URL.
   ========================================================================== */

const TRACK_ICONS = [
  'matrix',
  'brackets',
  'bus',
  'sigma',
  'convergence',
  'feedback',
  'waveform',
  'descent',
  'frames',
  'book',
] as const;

const tracks = defineCollection({
  loader: glob({ base: './src/content/tracks', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    icon: z.enum(TRACK_ICONS),
    order: z.number(),
    /** `planned` tracks render on the roadmap but aren't yet walkable. */
    status: z.enum(['active', 'planned']),
    /** Drives the default download extension for code blocks in this track. */
    language: z.enum(['matlab', 'python', 'none']).default('none'),
  }),
});

const modules = defineCollection({
  loader: file('./src/content/modules.json'),
  schema: z.object({
    id: z.string(),
    track: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    /** Every module ends in something you build. */
    project: z
      .object({
        title: z.string(),
        description: z.string(),
        capstone: z.boolean().default(false),
      })
      .optional(),
  }),
});

const lessons = defineCollection({
  loader: glob({ base: './src/content/lessons', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    track: z.string(),
    /** Matches a `slug` in modules.json. */
    module: z.string(),
    order: z.number(),
    description: z.string(),
    objectives: z.array(z.string()).min(1),
    /** Lesson ids within the same track — rendered as links, so typos show. */
    prerequisites: z.array(z.string()).default([]),
    estimatedMinutes: z.number().int().positive(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    /** e.g. ['Symbolic Math Toolbox'] — badged so a lesson never dead-ends. */
    toolboxes: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: file('./src/content/publications.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number().int(),
    type: z.enum(['journal', 'conference', 'preprint', 'thesis', 'poster']),
    status: z.enum(['published', 'accepted', 'under-review', 'in-preparation']),
    url: z.url().optional(),
    doi: z.string().optional(),
    abstract: z.string().optional(),
  }),
});

export const collections = {
  blog,
  notes,
  projects,
  journey,
  papers,
  learning,
  resources,
  publications,
  tracks,
  modules,
  lessons,
};
