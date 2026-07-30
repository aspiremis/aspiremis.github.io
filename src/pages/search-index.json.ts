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
  const [projects, posts, notes, papers, learning] = await Promise.all([
    getCollection('projects', isPublished),
    getCollection('blog', isPublished),
    getCollection('notes', isPublished),
    getCollection('papers'),
    getCollection('learning'),
  ]);

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

    ...learning.map((topic) => ({
      title: topic.data.title,
      href: '/learning',
      section: 'Learning',
      description: TOPIC_LABELS[topic.data.topic] ?? topic.data.description,
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
