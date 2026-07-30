import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

import { SITE } from '../consts';
import { isPublished } from '../lib/utils';

/**
 * Feed covers blog posts and notes together. Splitting them into two feeds would
 * mean subscribers pick one and miss the other, and both are the same kind of
 * thing to a reader: something new worth reading.
 */
export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('blog', isPublished)).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.date,
    link: `/blog/${post.id}`,
    categories: post.data.tags,
  }));

  const notes = (await getCollection('notes', isPublished)).map((note) => ({
    title: `${note.data.title} (note)`,
    description: note.data.description,
    pubDate: note.data.date,
    link: `/notes/${note.id}`,
    categories: note.data.tags,
  }));

  const items = [...posts, ...notes].sort(
    (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf(),
  );

  return rss({
    title: `${SITE.title} — Engineering Notebook`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>en-in</language><copyright>© ${new Date().getFullYear()} ${SITE.author}</copyright>`,
  });
};
