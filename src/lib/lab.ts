import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './utils';

/**
 * Query helpers for the Laboratory Academy.
 *
 * Deliberately a sibling of lib/learning.ts rather than a generalisation of it.
 * The two share a shape — a container with ordered children — but almost
 * nothing else: an experiment carries hardware, hazards, sub-parts and a
 * performed/not-performed status that a lesson has no use for. Forcing one
 * abstraction over both would make each read worse.
 *
 * Progress state is the one thing that IS shared: both use the same
 * localStorage store, so the Learning Hub's ring and the Academy's count the
 * same ticks (see ProgressStore.astro).
 */

export type LabCourse = CollectionEntry<'labCourses'>;
export type Experiment = CollectionEntry<'experiments'>;
export type Instrument = CollectionEntry<'instruments'>;
export type LabGuide = CollectionEntry<'labGuides'>;

/** One half of a course — PSAO's hardware set, or its MATLAB set. */
export interface CoursePart {
  id: string;
  title: string;
  timing: string;
  count: number;
  status: 'active' | 'upcoming' | 'planned';
  description: string;
  experiments: Experiment[];
  /** count minus what's written — how many cards render as empty slots. */
  pending: number;
}

export interface CourseTree {
  course: LabCourse;
  parts: CoursePart[];
  experimentCount: number;
  minutes: number;
}

/* --------------------------------------------------------------------------
   Paths
   -------------------------------------------------------------------------- */

/** Experiment ids are `<course>/<slug>`, which is also the URL tail. */
export function experimentPath(experiment: Experiment): string {
  return `/lab/${experiment.id}`;
}

export function coursePath(course: LabCourse): string {
  return `/lab/${course.data.id}`;
}

export function instrumentPath(instrument: Instrument): string {
  return `/lab/instruments/${instrument.id}`;
}

export function guidePath(guide: LabGuide): string {
  return `/lab/foundations/${guide.id}`;
}

/* --------------------------------------------------------------------------
   Queries
   -------------------------------------------------------------------------- */

export async function getCourses(): Promise<LabCourse[]> {
  return (await getCollection('labCourses')).sort((a, b) => a.data.order - b.data.order);
}

export async function getExperiments(course?: string): Promise<Experiment[]> {
  const experiments = await getCollection('experiments', isPublished);
  return experiments
    .filter((e) => !course || e.data.course === course)
    .sort((a, b) => a.data.number - b.data.number);
}

export async function getInstruments(): Promise<Instrument[]> {
  return (await getCollection('instruments', isPublished)).sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getGuides(section?: 'before' | 'safety'): Promise<LabGuide[]> {
  const guides = await getCollection('labGuides', isPublished);
  return guides
    .filter((g) => !section || g.data.section === section)
    .sort((a, b) => a.data.order - b.data.order);
}

/**
 * Assembles one course's tree.
 *
 * `pending` is the point: a part declares how many experiments it will hold,
 * so the five MATLAB slots render as real cards marked upcoming before a word
 * of them is written. Showing the shape of what's coming is more honest than
 * an empty section that looks finished.
 */
export async function getCourseTree(courseId: string): Promise<CourseTree | null> {
  const [courses, experiments] = await Promise.all([
    getCollection('labCourses'),
    getExperiments(courseId),
  ]);

  const course = courses.find((c) => c.data.id === courseId);
  if (!course) return null;

  const parts: CoursePart[] = course.data.parts.map((part) => {
    const own = experiments.filter((e) => e.data.part === part.id);
    return {
      ...part,
      experiments: own,
      pending: Math.max(0, part.count - own.length),
    };
  });

  return {
    course,
    parts,
    experimentCount: experiments.length,
    minutes: experiments.reduce((sum, e) => sum + e.data.estimatedMinutes, 0),
  };
}

export async function getAllCourseTrees(): Promise<CourseTree[]> {
  const courses = await getCourses();
  const trees = await Promise.all(courses.map((c) => getCourseTree(c.data.id)));
  return trees.filter((t): t is CourseTree => t !== null);
}

/** Previous/next across the whole course, crossing the hardware/software line. */
export async function getExperimentNeighbours(experiment: Experiment): Promise<{
  previous: Experiment | null;
  next: Experiment | null;
}> {
  const tree = await getCourseTree(experiment.data.course);
  if (!tree) return { previous: null, next: null };

  const ordered = tree.parts.flatMap((p) => p.experiments);
  const index = ordered.findIndex((e) => e.id === experiment.id);

  return {
    previous: index > 0 ? ordered[index - 1]! : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1]! : null,
  };
}

/** Resolves instrument ids on an experiment to real pages, dropping unknowns. */
export async function resolveInstruments(experiment: Experiment): Promise<Instrument[]> {
  if (!experiment.data.instruments.length) return [];
  const all = await getInstruments();

  return experiment.data.instruments
    .map((id) => all.find((i) => i.id === id))
    .filter((i): i is Instrument => i !== undefined);
}

/** The inverse — which experiments put this instrument on the bench. */
export async function experimentsUsing(instrumentId: string): Promise<Experiment[]> {
  const experiments = await getExperiments();
  return experiments.filter((e) => e.data.instruments.includes(instrumentId));
}

/* --------------------------------------------------------------------------
   Display
   -------------------------------------------------------------------------- */

export const INSTRUMENT_CATEGORIES = [
  { id: 'measurement', label: 'Measurement', blurb: 'Reading what the circuit is doing' },
  { id: 'source', label: 'Sources & supplies', blurb: 'Where the energy comes from' },
  { id: 'transformer', label: 'Transformers', blurb: 'Changing level, and isolating' },
  { id: 'protection', label: 'Protection', blurb: 'Deciding when to disconnect' },
  { id: 'load', label: 'Loads', blurb: 'What the network is built to feed' },
  { id: 'machine', label: 'Machines', blurb: 'Rotating plant' },
  { id: 'switchgear', label: 'Switchgear', blurb: 'Making and breaking connections' },
  { id: 'data', label: 'Data & control', blurb: 'SCADA, PLC and acquisition' },
] as const;

/**
 * The Level 0–5 ladder from the Academy roadmap.
 *
 * It doubles as the spine of every experiment page: a stage heading carries the
 * level it serves, so the roadmap is structure rather than decoration.
 */
export const LAB_LEVELS = [
  {
    level: 0,
    title: 'Never entered a lab',
    blurb: 'What a laboratory is, how a session runs, how to read a diagram.',
  },
  { level: 1, title: 'Know the hardware', blurb: 'Every instrument on the bench, and why it exists.' },
  { level: 2, title: 'Understand the theory', blurb: 'The derivation behind what the meters will show.' },
  { level: 3, title: 'Perform the experiment', blurb: 'Wiring, procedure, observation, analysis.' },
  { level: 4, title: 'Simulate it', blurb: 'The same experiment in MATLAB and Python.' },
  { level: 5, title: 'Connect it to the grid', blurb: 'Where substations, utilities and research use this.' },
] as const;

export const EXPERIMENT_STATUS = {
  prepared: {
    label: 'Prepared',
    hint: 'Studied, not yet performed on the bench',
    tone: 'text-subtle',
    dot: 'bg-subtle/50',
  },
  performed: {
    label: 'Performed',
    hint: 'Run in the lab; write-up in progress',
    tone: 'text-accent',
    dot: 'bg-accent',
  },
  'written-up': {
    label: 'Written up',
    hint: 'Performed, analysed and recorded',
    tone: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-600',
  },
} as const;

export const PART_STATUS = {
  active: { label: 'In progress', tone: 'text-accent' },
  upcoming: { label: 'After mid-semester', tone: 'text-subtle' },
  planned: { label: 'Planned', tone: 'text-subtle' },
} as const;
