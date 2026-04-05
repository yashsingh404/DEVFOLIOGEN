import type { AboutData, FeaturedProject, NormalizedProfile, ProjectsData } from '@/types/github';
import type {
  PortfolioRole,
  PortfolioStyle,
  PresentedPortfolioData,
  RecruiterBrief,
  RecruiterSignals,
  RoleNarrative,
  TimelineEvent,
} from '@/types/portfolio';
import type { PRByOrg } from '@/components/portfolio/prs-by-org-section';

const ROLE_CONFIG: Record<
  PortfolioRole,
  {
    label: string;
    headline: string;
    keywords: string[];
    recruiterPitch: string;
  }
> = {
  fullstack: {
    label: 'Full-Stack Mode',
    headline: 'Balanced builder across product surfaces, APIs, and delivery',
    keywords: ['typescript', 'javascript', 'react', 'next', 'node', 'api', 'postgres', 'fullstack'],
    recruiterPitch: 'Best suited for end-to-end product teams that value breadth, shipping speed, and cross-functional ownership.',
  },
  frontend: {
    label: 'Frontend Mode',
    headline: 'Crafting polished product surfaces with strong interface instincts',
    keywords: ['react', 'next', 'typescript', 'javascript', 'css', 'tailwind', 'ui', 'design'],
    recruiterPitch: 'Strong fit for frontend and design-engineering roles where UX quality and interface ownership matter.',
  },
  backend: {
    label: 'Backend Mode',
    headline: 'Building reliable systems, APIs, and platform foundations',
    keywords: ['node', 'api', 'postgres', 'graphql', 'database', 'auth', 'server', 'backend'],
    recruiterPitch: 'Best suited for backend and platform roles focused on APIs, data models, infrastructure, and reliability.',
  },
  ai: {
    label: 'AI Mode',
    headline: 'Applying LLMs and intelligent workflows to real developer products',
    keywords: ['ai', 'llm', 'openai', 'groq', 'rag', 'python', 'agents', 'prompt'],
    recruiterPitch: 'Strong fit for applied AI roles that need product sense, experimentation, and shipping discipline.',
  },
};

function normalizeText(value: string | null | undefined) {
  return (value || '').toLowerCase();
}

function projectRoleScore(project: FeaturedProject, role: PortfolioRole) {
  const config = ROLE_CONFIG[role];
  const haystack = [
    project.name,
    project.description,
    project.language,
    ...(project.topics || []),
    ...Object.keys(project.languages || {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const keywordScore = config.keywords.reduce((sum, keyword) => {
    return sum + (haystack.includes(keyword) ? 3 : 0);
  }, 0);

  const engagementScore = Math.min(project.stars, 300) / 20 + Math.min(project.forks, 80) / 10;
  const freshnessScore = Math.max(
    0,
    12 - Math.floor((Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  return keywordScore + engagementScore + freshnessScore;
}

function getSortedProjects(projects: ProjectsData | undefined, role: PortfolioRole): ProjectsData | undefined {
  if (!projects) {
    return undefined;
  }

  const featured = [...projects.featured].sort(
    (a, b) => projectRoleScore(b, role) - projectRoleScore(a, role)
  );

  return {
    ...projects,
    featured,
  };
}

function getTopLanguages(projects: ProjectsData | undefined) {
  return Object.entries(projects?.languages || {})
    .filter(([language, value]) => Boolean(language) && language.toLowerCase() !== 'unknown' && value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([language]) => language);
}

function buildRoleNarrative(
  profile: NormalizedProfile,
  about: AboutData | null | undefined,
  projects: ProjectsData | undefined,
  prsByOrg: PRByOrg[],
  role: PortfolioRole
): RoleNarrative {
  const config = ROLE_CONFIG[role];
  const topProjects = (projects?.featured || []).slice(0, 3);
  const topLanguages = getTopLanguages(projects);
  const externalPRCount = prsByOrg.reduce((sum, org) => sum + org.prs.length, 0);

  const projectNames = topProjects.map(project => project.name).join(', ');
  const skills = Array.from(new Set([...(about?.skills || []), ...topLanguages])).slice(0, 8);

  const summaryParts = [
    about?.summary || profile.bio || `${profile.name || profile.username} builds in public and ships through code.`,
    `This view emphasizes ${config.label.toLowerCase().replace(' mode', '')} strengths using repository language signals, project topics, and recent activity.`,
    projectNames ? `Highest-signal projects for this lens include ${projectNames}.` : null,
  ].filter(Boolean);

  const highlights = [
    topLanguages.length > 0
      ? `Most visible technical depth shows up in ${topLanguages.slice(0, 3).join(', ')}.`
      : null,
    topProjects[0]
      ? `${topProjects[0].name} stands out as the strongest ${config.label.toLowerCase().replace(' mode', '')} proof point right now.`
      : null,
    externalPRCount > 0
      ? `Public contribution trail includes ${externalPRCount.toLocaleString()} pull requests across ${prsByOrg.length} organizations.`
      : `Primary signal comes from owned repositories and direct product output.`,
  ].filter(Boolean) as string[];

  return {
    id: role,
    label: config.label,
    headline: config.headline,
    summary: summaryParts.join(' '),
    highlights,
    skills,
    recruiterPitch: config.recruiterPitch,
  };
}

function buildTimeline(
  profile: NormalizedProfile,
  projects: ProjectsData | undefined,
  prsByOrg: PRByOrg[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const featured = projects?.featured || [];
  const latestProject = [...featured].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0];
  const oldestProject = [...featured].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )[0];
  const topProject = [...featured].sort((a, b) => b.stars - a.stars)[0];
  const recentPR = prsByOrg
    .flatMap(org => org.prs.map(pr => ({ ...pr, orgName: org.orgName })))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  events.push({
    date: profile.created_at,
    title: 'GitHub foundation',
    description: `${profile.name || profile.username} started building in public on GitHub.`,
    kind: 'milestone',
    href: `https://github.com/${profile.username}`,
  });

  if (oldestProject) {
    events.push({
      date: oldestProject.created_at,
      title: `Early shipped project: ${oldestProject.name}`,
      description: 'Marks one of the earliest surviving public proof points in this portfolio.',
      kind: 'project',
      href: oldestProject.url,
    });
  }

  if (topProject) {
    events.push({
      date: topProject.updated_at,
      title: `Highest-signal repo: ${topProject.name}`,
      description: `${topProject.stars.toLocaleString()} stars and ${topProject.forks.toLocaleString()} forks make this the strongest external validation point.`,
      kind: 'signal',
      href: topProject.url,
    });
  }

  if (recentPR) {
    events.push({
      date: recentPR.updatedAt,
      title: `Recent open-source contribution in ${recentPR.orgName}`,
      description: recentPR.title,
      kind: 'open-source',
      href: recentPR.url,
    });
  }

  if (latestProject) {
    events.push({
      date: latestProject.updated_at,
      title: `Currently shipping: ${latestProject.name}`,
      description: 'Most recently updated project in the portfolio signal set.',
      kind: 'project',
      href: latestProject.url,
    });
  }

  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}

function buildRecruiterSignals(
  profile: NormalizedProfile,
  projects: ProjectsData | undefined,
  prsByOrg: PRByOrg[]
): RecruiterSignals {
  const activeYears = Math.max(
    1,
    Math.round((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))
  );
  const recentlyUpdated = (projects?.featured || []).filter(project => {
    return Date.now() - new Date(project.updated_at).getTime() < 1000 * 60 * 60 * 24 * 120;
  }).length;
  const latestUpdate = (projects?.featured || [])
    .map(project => project.updated_at)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || profile.updated_at || profile.created_at;
  const lastActiveDate = new Date(latestUpdate);
  const monthsAgo = Math.max(
    0,
    Math.round((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  return {
    activeYears,
    totalStars: projects?.total_stars || 0,
    repoCount: projects?.total_repos || profile.public_repos,
    externalPRs: prsByOrg.reduce((sum, org) => sum + org.prs.length, 0),
    recentProjectCount: recentlyUpdated,
    lastActiveLabel: monthsAgo <= 1 ? 'Active in the last month' : `Active ${monthsAgo} months ago`,
    shippingVelocity:
      recentlyUpdated >= 4
        ? 'High recent shipping velocity'
        : recentlyUpdated >= 2
          ? 'Steady recent shipping velocity'
          : 'Selective but visible recent shipping',
  };
}

function buildRecruiterBrief(
  profile: NormalizedProfile,
  narrative: RoleNarrative,
  projects: ProjectsData | undefined,
  signals: RecruiterSignals
): RecruiterBrief {
  const topProjects = (projects?.featured || []).slice(0, 3);
  const contactHref = profile.email
    ? `mailto:${profile.email}`
    : profile.website || `https://github.com/${profile.username}`;

  return {
    headline: `${profile.name || profile.username} | ${narrative.headline}`,
    topFit: narrative.recruiterPitch,
    impactBullets: [
      `${signals.repoCount.toLocaleString()} public repositories with ${signals.totalStars.toLocaleString()} total stars across featured work.`,
      `${signals.activeYears}+ years of visible GitHub history with ${signals.shippingVelocity.toLowerCase()}.`,
      signals.externalPRs > 0
        ? `${signals.externalPRs.toLocaleString()} public pull requests across external organizations.`
        : `${signals.lastActiveLabel} with portfolio strength concentrated in owned projects and direct shipping output.`,
    ],
    focusAreas: narrative.skills.filter(skill => skill.toLowerCase() !== 'unknown').slice(0, 6),
    projects: topProjects.map(project => ({
      name: project.name,
      url: project.url,
      reason: `${project.language && project.language.toLowerCase() !== 'unknown' ? project.language : 'Core project'} with ${project.stars.toLocaleString()} stars and signals aligned to the selected role lens.`,
      stars: project.stars,
      language: project.language && project.language.toLowerCase() !== 'unknown' ? project.language : null,
    })),
    contactHref,
  };
}

export function presentPortfolioData({
  profile,
  about,
  projects,
  prsByOrg,
  role,
}: {
  profile: NormalizedProfile;
  about: AboutData | null | undefined;
  projects: ProjectsData | undefined;
  prsByOrg: PRByOrg[];
  role: PortfolioRole;
}): PresentedPortfolioData {
  const rankedProjects = getSortedProjects(projects, role);
  const roleNarrative = buildRoleNarrative(profile, about, rankedProjects, prsByOrg, role);
  const recruiterSignals = buildRecruiterSignals(profile, rankedProjects, prsByOrg);
  const recruiterBrief = buildRecruiterBrief(profile, roleNarrative, rankedProjects, recruiterSignals);
  const timeline = buildTimeline(profile, rankedProjects, prsByOrg);

  return {
    roleNarrative,
    projects: rankedProjects,
    timeline,
    recruiterBrief,
    recruiterSignals,
  };
}

export function parsePortfolioRole(value: string | undefined): PortfolioRole {
  if (value && value in ROLE_CONFIG) {
    return value as PortfolioRole;
  }

  return 'fullstack';
}

export function parsePortfolioView(value: string | undefined) {
  return value === 'recruiter' ? 'recruiter' : 'default';
}

export function parsePortfolioStyle(value: string | undefined): PortfolioStyle {
  if (value === 'bold' || value === 'developer-dark') {
    return value;
  }

  return 'minimal';
}

export function getRoleLabel(role: PortfolioRole) {
  return ROLE_CONFIG[role].label;
}

export function getPortfolioBriefText({
  profile,
  brief,
  signals,
}: {
  profile: NormalizedProfile;
  brief: RecruiterBrief;
  signals: RecruiterSignals;
}) {
  return [
    `${profile.name || profile.username}`,
    brief.headline,
    '',
    'Top fit',
    brief.topFit,
    '',
    'Impact bullets',
    ...brief.impactBullets.map(item => `- ${item}`),
    '',
    'Focus areas',
    ...brief.focusAreas.map(item => `- ${item}`),
    '',
    'Selected projects',
    ...brief.projects.map(
      project => `- ${project.name}: ${project.reason} (${project.url})`
    ),
    '',
    'Signals',
    `- ${signals.activeYears}+ years active on GitHub`,
    `- ${signals.repoCount} repositories`,
    `- ${signals.totalStars} total stars`,
    `- ${signals.externalPRs} external PRs`,
    '',
    `Contact: ${brief.contactHref}`,
  ].join('\n');
}

export function describeRoleProject(project: FeaturedProject, role: PortfolioRole) {
  const primaryTopic = project.topics[0];
  const language = normalizeText(project.language) || 'project';

  if (role === 'frontend') {
    return primaryTopic
      ? `Strong UI-facing signal through ${project.language || 'web'} work and ${primaryTopic} focus.`
      : `Strong UI-facing signal through ${project.language || 'frontend'} work.`;
  }

  if (role === 'backend') {
    return `Good backend proof point with ${project.language || 'service'} implementation and repository depth.`;
  }

  if (role === 'ai') {
    return primaryTopic
      ? `Useful applied AI signal with ${primaryTopic} context and ${project.language || 'product'} implementation.`
      : `Useful applied AI signal with a productized ${language} implementation.`;
  }

  return `Balanced end-to-end signal with visible product and engineering execution.`;
}
