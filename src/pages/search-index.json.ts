import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

import { ALL_PAGES, TOPIC_LABELS } from '../consts';
import { isPublished, byDateDesc } from '../lib/utils';

/**
 * Index consumed by the ⌘K palette, emitted as a static JSON file.
 *
 * Kept out of the page HTML deliberately: the palette fetches this on first
 * open, so a visitor who never presses ⌘K never downloads it.
 */
export const GET: APIRoute = async () => {
  const [projects, posts, notes, papers, learning, lessons, tracks] = await Promise.all([
    getCollection('projects', isPublished),
    getCollection('blog', isPublished),
    getCollection('notes', isPublished),
    getCollection('papers'),
    getCollection('learning'),
    getCollection('lessons', isPublished),
    getCollection('tracks'),
  ]);

  const trackTitle = new Map(tracks.map((t) => [t.id, t.data.title]));

  const index = [
    ...ALL_PAGES.map((page) => ({
      title: page.label,
      href: page.href,
      section: 'Pages',
    })),

    ...projects.map((project) => ({
      title: project.data.title,
      href: `/projects/${project.id}`,
      section: 'Projects',
      description: project.data.summary,
    })),

    ...posts.sort(byDateDesc).map((post) => ({
      title: post.data.title,
      href: `/blog/${post.id}`,
      section: 'Blog',
      description: post.data.description,
    })),

    ...notes.sort(byDateDesc).map((note) => ({
      title: note.data.title,
      href: `/notes/${note.id}`,
      section: 'Notes',
      description: note.data.description,
    })),

    ...papers.map((paper) => ({
      title: paper.data.title,
      href: '/research',
      section: 'Papers',
      description: `${paper.data.authors[0] ?? ''} et al., ${paper.data.venue} ${paper.data.year}`,
    })),

    // Tracks first, then lessons — searching "matlab" should surface the track
    // itself above any individual lesson that happens to mention it.
    ...tracks.map((track) => ({
      title: `${track.data.title} track`,
      href: `/learning/${track.id}`,
      section: 'Learning Hub',
      description: track.data.tagline,
    })),

    ...lessons
      .sort((a, b) => a.data.order - b.data.order)
      .map((lesson) => ({
        title: lesson.data.title,
        href: `/learning/${lesson.id}`,
        section: 'Lessons',
        description: `${trackTitle.get(lesson.data.track) ?? lesson.data.track} · ${lesson.data.description}`,
      })),

    ...learning.map((topic) => ({
      title: topic.data.title,
      href: '/learning/progress',
      section: 'Studying',
      description: TOPIC_LABELS[topic.data.topic] ?? topic.data.description,
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
