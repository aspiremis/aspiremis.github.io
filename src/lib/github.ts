import { PROFILE } from '../consts';

/**
 * GitHub data, fetched at *build time*.
 *
 * A static site can't call the API from the browser without leaking a token and
 * paying a request on every page view, so instead the workflow rebuilds nightly
 * and bakes the results in. Everything here fails soft: if GitHub is down, rate
 * limits, or the token is missing, the page renders a graceful fallback rather
 * than failing the deploy.
 */

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
}

export interface ContributionDay {
  date: string;
  count: number;
  /** 0–4, matching GitHub's own intensity buckets. */
  level: number;
}

export interface ContributionCalendar {
  total: number;
  weeks: ContributionDay[][];
  from: string;
  to: string;
}

const TOKEN = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

function headers(): Record<string, string> {
  const base: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'shalini-ee.github.io-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) base.Authorization = `Bearer ${TOKEN}`;
  return base;
}

/** Abort rather than hang a CI build on a slow API. */
async function fetchWithTimeout(url: string, init: RequestInit, ms = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getRepos(limit = 6): Promise<Repo[]> {
  try {
    const res = await fetchWithTimeout(
      `https://api.github.com/users/${PROFILE.github}/repos?per_page=100&sort=updated`,
      { headers: headers() },
    );
    if (!res.ok) throw new Error(`GitHub REST responded ${res.status}`);

    const data = (await res.json()) as any[];
    return data
      // The profile README repo (username/username) is meta, not a project.
      .filter((r) => !r.fork && !r.archived && r.name !== PROFILE.github)
      .slice(0, limit)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        updatedAt: r.pushed_at ?? r.updated_at,
        topics: r.topics ?? [],
      }));
  } catch (error) {
    console.warn(
      `[github] Could not load repositories — rendering fallback. ${(error as Error).message}`,
    );
    return [];
  }
}

const CALENDAR_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
    }
  }
`;

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * The contribution graph is only available through GraphQL, which *requires*
 * a token even for public data. In CI that's the workflow's GITHUB_TOKEN;
 * locally it's usually absent, so this returns null and the component shows a
 * link-out instead.
 */
export async function getContributions(): Promise<ContributionCalendar | null> {
  if (!TOKEN) {
    console.info('[github] No GITHUB_TOKEN — skipping contribution calendar.');
    return null;
  }

  try {
    const res = await fetchWithTimeout('https://api.github.com/graphql', {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: CALENDAR_QUERY, variables: { login: PROFILE.github } }),
    });
    if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}`);

    const json = (await res.json()) as any;
    if (json.errors?.length) throw new Error(json.errors[0].message);

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) throw new Error('Calendar missing from response');

    const weeks: ContributionDay[][] = calendar.weeks.map((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
    );

    const flat = weeks.flat();
    return {
      total: calendar.totalContributions,
      weeks,
      from: flat[0]?.date ?? '',
      to: flat.at(-1)?.date ?? '',
    };
  } catch (error) {
    console.warn(
      `[github] Could not load contribution calendar — rendering fallback. ${(error as Error).message}`,
    );
    return null;
  }
}
