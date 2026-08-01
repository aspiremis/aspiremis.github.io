/**
 * The Learning Hub's progress store is attached to `window` by
 * ProgressStore.astro so that any component on the page can read or update
 * completion state without importing anything. Declaring it here keeps that
 * contract type-checked rather than reaching for `any` at each call site.
 */
interface LearnProgressEntry {
  done: boolean;
  at: number;
}

interface LearnProgressStore {
  all(): Record<string, LearnProgressEntry>;
  isDone(lessonId: string): boolean;
  set(lessonId: string, done: boolean): boolean;
  toggle(lessonId: string): boolean;
  countDone(lessonIds: string[]): number;
  lastTouched(): { id: string; at: number } | null;
  reset(): void;
  export(): string;
  import(json: string): void;
}

interface Window {
  learnProgress?: LearnProgressStore;
}
