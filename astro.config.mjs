// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Deployed as a GitHub *user* site (shalini-ee.github.io), so the site lives at
// the domain root and needs no `base`. Keeping it that way avoids every class of
// broken-asset bug that project pages (/repo-name/) introduce.
// Mirrored in src/consts.ts as SITE.url — keep the two in sync.
export default defineConfig({
  site: 'https://shalini-ee.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],

  markdown: {
    processor: unified({
      // Power-systems writing is math-heavy: $V_i$, Y-bus matrices, per-unit
      // derivations. remark-math + rehype-katex renders it at build time, so no
      // client-side math library ships to the browser.
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [
          // Anchor links on section headings, so any part of a long note is
          // directly linkable. Astro generates the heading ids itself.
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
            content: { type: 'text', value: '#' },
          },
        ],
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
