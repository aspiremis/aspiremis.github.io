import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './utils';

/**
 * Query helpers for the Learning Hub.
 *
 * Everything here runs at build time. The one thing that deliberately does NOT
 * live here is completion state — that's per-visitor, held in localStorage, and
 * applied on the client (see ProgressStore.astro). Keeping the two separate is
 * what lets pages be fully static and still show personal progress.
 */

export type Track = CollectionEntry<'tracks'>;
export type Module = CollectionEntry<'modules'>;
export type Lesson = CollectionEntry<'lessons'>;

/** A module with its lessons already attached, in reading order. */
export interface ModuleWithLessons {
  module: Module;
  lessons: Lesson[];
}

/** A track with its full module tree — what the track page renders from. */
export interface TrackTree {
  track: Track;
  modules: ModuleWithLessons[];
  lessonCount: number;
  /** Total estimated time across the track, in minutes. */
  minutes: number;
}

/** `matlab/variables` — the lesson id, which is also its URL path. */
export function lessonPath(lesson: Lesson): string {
  return `/learning/${lesson.id}`;
}

export function trackPath(track: Track): string {
  return `/learning/${track.id}`;
}

export async function getTracks(): Promise<Track[]> {
  return (await getCollection('tracks')).sort((a, b) => a.data.order - b.data.order);
}

export async function getLessons(track?: string): Promise<Lesson[]> {
  const lessons = await getCollection('lessons', isPublished);
  return lessons
    .filter((lesson) => !track || lesson.data.track === track)
    .sort((a, b) => a.data.order - b.data.order);
}

/**
 * Assembles one track's full tree.
 *
 * Modules with no lessons are kept deliberately: a scaffolded module still
 * renders as a roadmap entry with its objectives visible, which is the honest
 * way to show "planned but not written" rather than hiding it.
 */
export async function getTrackTree(trackId: string): Promise<TrackTree | null> {
  const [tracks, allModules, lessons] = await Promise.all([
    getCollection('tracks'),
    getCollection('modules'),
    getLessons(trackId),
  ]);

  const track = tracks.find((t) => t.id === trackId);
  if (!track) return null;

  const modules = allModules
    .filter((m) => m.data.track === trackId)
    .sort((a, b) => a.data.order - b.data.order)
    .map((module) => ({
      module,
      lessons: lessons
        .filter((l) => l.data.module === module.data.slug)
        .sort((a, b) => a.data.order - b.data.order),
    }));

  return {
    track,
    modules,
    lessonCount: lessons.length,
    minutes: lessons.reduce((sum, l) => sum + l.data.estimatedMinutes, 0),
  };
}

export async function getAllTrackTrees(): Promise<TrackTree[]> {
  const tracks = await getTracks();
  const trees = await Promise.all(tracks.map((t) => getTrackTree(t.id)));
  return trees.filter((t): t is TrackTree => t !== null);
}

/**
 * Previous/next across the whole track, crossing module boundaries — the
 * reader experiences one continuous sequence, not a set of disconnected units.
 */
export async function getLessonNeighbours(lesson: Lesson): Promise<{
  previous: Lesson | null;
  next: Lesson | null;
}> {
  const tree = await getTrackTree(lesson.data.track);
  if (!tree) return { previous: null, next: null };

  const ordered = tree.modules.flatMap((m) => m.lessons);
  const index = ordered.findIndex((l) => l.id === lesson.id);

  return {
    previous: index > 0 ? ordered[index - 1]! : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1]! : null,
  };
}

/** Resolves prerequisite ids to real lessons, dropping any that don't exist. */
export async function resolvePrerequisites(lesson: Lesson): Promise<Lesson[]> {
  if (!lesson.data.prerequisites.length) return [];
  const lessons = await getLessons(lesson.data.track);

  return lesson.data.prerequisites
    .map((slug) => lessons.find((l) => l.id === `${lesson.data.track}/${slug}` || l.id === slug))
    .filter((l): l is Lesson => l !== undefined);
}

export function findModule(tree: TrackTree, slug: string): Module | undefined {
  return tree.modules.find((m) => m.module.data.slug === slug)?.module;
}

/** `4h 30m` / `45m` — used on track cards and module headers. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export const DIFFICULTY = {
  beginner: { label: 'Beginner', tone: 'text-emerald-700 dark:text-emerald-400' },
  intermediate: { label: 'Intermediate', tone: 'text-accent' },
  advanced: { label: 'Advanced', tone: 'text-rose-700 dark:text-rose-400' },
} as const;
