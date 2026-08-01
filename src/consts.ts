/**
 * Single source of truth for identity, navigation and social links.
 * Every component reads from here so there is exactly one place to edit
 * when something about Shalini's situation changes.
 */

export const SITE = {
  url: 'https://aspiremis.github.io',
  title: 'Shalini Mishra',
  tagline: 'Understanding the grid, one simulation at a time.',
  description:
    'Engineering notebook of Shalini Mishra — M.Tech Power Systems Engineering at IIT Bhubaneswar. Power system simulation, renewable grid integration, power quality, and machine learning for energy.',
  author: 'Shalini Mishra',
  email: 'shalinimishra7068@gmail.com',
  locale: 'en_IN',
  lang: 'en',
} as const;

export const PROFILE = {
  name: 'Shalini Mishra',
  role: 'M.Tech, Power Systems Engineering',
  institute: 'IIT Bhubaneswar',
  instituteUrl: 'https://www.iitbbs.ac.in/',
  github: 'aspiremis',
  linkedin: 'shalini-ee',
  startedAt: '2026-07',
  /** Rolling "what I'm on right now" line, surfaced on the home hero. */
  currentFocus:
    'Learning MATLAB properly from first principles, and scoping a load-flow solver I want to write from scratch rather than call.',
} as const;

export const SOCIALS = [
  { label: 'GitHub', href: `https://github.com/${PROFILE.github}`, icon: 'github' },
  { label: 'LinkedIn', href: `https://www.linkedin.com/in/${PROFILE.linkedin}/`, icon: 'linkedin' },
  { label: 'Email', href: `mailto:${SITE.email}`, icon: 'mail' },
] as const;

/**
 * Top-level navigation. Deliberately six items: the ten sections of the site
 * are all reachable, but Blog+Notes collapse into "Writing" and Resources sits
 * under "Learning" so the header never wraps.
 */
export const NAV = [
  { label: 'Journey', href: '/journey' },
  { label: 'Projects', href: '/projects' },
  { label: 'Research', href: '/research' },
  {
    label: 'Writing',
    href: '/blog',
    children: [
      { label: 'Blog', href: '/blog', hint: 'Long-form posts' },
      { label: 'Notes', href: '/notes', hint: 'Short technical notes' },
    ],
  },
  {
    label: 'Learning',
    href: '/learning',
    children: [
      { label: 'Learning Hub', href: '/learning', hint: 'Courses I am writing' },
      { label: 'MATLAB', href: '/learning/matlab', hint: 'From zero to load flow' },
      { label: 'Python', href: '/learning/python', hint: 'Scientific computing' },
      { label: 'Progress', href: '/learning/progress', hint: 'What I am studying' },
      { label: 'Resources', href: '/resources', hint: 'Books, courses, tools' },
    ],
  },
  { label: 'About', href: '/about' },
] as const;

/** Flat list used by the command palette and the footer sitemap. */
export const ALL_PAGES = [
  { label: 'Home', href: '/', section: 'Pages' },
  { label: 'Journey', href: '/journey', section: 'Pages' },
  { label: 'Projects', href: '/projects', section: 'Pages' },
  { label: 'Research', href: '/research', section: 'Pages' },
  { label: 'Learning Hub', href: '/learning', section: 'Pages' },
  { label: 'Notes', href: '/notes', section: 'Pages' },
  { label: 'Resources', href: '/resources', section: 'Pages' },
  { label: 'Blog', href: '/blog', section: 'Pages' },
  { label: 'About', href: '/about', section: 'Pages' },
  { label: 'Contact', href: '/contact', section: 'Pages' },
] as const;

/**
 * Learning taxonomy. Used to group /learning, to validate note frontmatter,
 * and to render topic filters. Order is intentional — core power engineering
 * first, then the computational tooling that supports it.
 */
export const TOPICS = [
  { slug: 'power-systems', label: 'Power Systems' },
  { slug: 'distribution-systems', label: 'Distribution Systems' },
  { slug: 'power-quality', label: 'Power Quality' },
  { slug: 'renewable-integration', label: 'Renewable Integration' },
  { slug: 'control-systems', label: 'Control Systems' },
  { slug: 'electrical-machines', label: 'Electrical Machines' },
  { slug: 'power-electronics', label: 'Power Electronics' },
  { slug: 'optimization', label: 'Optimization' },
  { slug: 'machine-learning', label: 'Machine Learning' },
  { slug: 'matlab', label: 'MATLAB' },
  { slug: 'python', label: 'Python' },
  { slug: 'simulation', label: 'Simulation' },
  { slug: 'research-papers', label: 'Research Papers' },
] as const;

export type TopicSlug = (typeof TOPICS)[number]['slug'];

export const TOPIC_LABELS: Record<string, string> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t.label]),
);
