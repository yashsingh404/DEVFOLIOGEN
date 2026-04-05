import type { NormalizedProfile, AboutData, SEOData, ProjectsData, FeaturedProject } from './github'

export type { NormalizedProfile, AboutData, SEOData, ProjectsData, FeaturedProject }

export interface PortfolioData {
  profile: NormalizedProfile;
  about?: AboutData | null;
  seo?: SEOData | null;
  projects?: ProjectsData;
}

export type PortfolioRole = 'fullstack' | 'frontend' | 'backend' | 'ai';
export type PortfolioView = 'default' | 'recruiter';
export type PortfolioStyle = 'minimal' | 'bold' | 'developer-dark';

export interface RoleNarrative {
  id: PortfolioRole;
  label: string;
  headline: string;
  summary: string;
  highlights: string[];
  skills: string[];
  recruiterPitch: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  kind: 'milestone' | 'project' | 'open-source' | 'signal';
  href?: string;
}

export interface RecruiterProjectBrief {
  name: string;
  url: string;
  reason: string;
  stars: number;
  language: string | null;
}

export interface RecruiterBrief {
  headline: string;
  topFit: string;
  impactBullets: string[];
  focusAreas: string[];
  projects: RecruiterProjectBrief[];
  contactHref: string;
}

export interface RecruiterSignals {
  activeYears: number;
  totalStars: number;
  repoCount: number;
  externalPRs: number;
  shippingVelocity: string;
  recentProjectCount: number;
  lastActiveLabel: string;
}

export interface PresentedPortfolioData {
  roleNarrative: RoleNarrative;
  projects?: ProjectsData;
  timeline: TimelineEvent[];
  recruiterBrief: RecruiterBrief;
  recruiterSignals: RecruiterSignals;
}

export type Project = FeaturedProject

export interface LinkedInData {
  username: string;
  name: string | null;
  headline: string | null;
  location: string | null;
  profile_url: string;
  avatar_url: string | null;
  summary: string | null;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
  location?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  duration: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  email?: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  totalContributions: number;
  weeks: {
    days: ContributionDay[];
  }[];
}
