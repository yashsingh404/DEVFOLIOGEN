import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaEnvelope, FaLinkedin, FaXTwitter, FaGlobe } from 'react-icons/fa6';
import { FaArrowRight, FaLocationArrow, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import type { NormalizedProfile } from '@/types/github';
import SectionBorder from './section-border';
import { ShareButton } from './share-button';
import { PortfolioControls } from './portfolio-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getPortfolioStyleConfig } from '@/lib/portfolio/style';
import type { PortfolioStyle, PortfolioView, RoleNarrative } from '@/types/portfolio';
import { PortfolioDownloadButton } from './portfolio-download-button';

interface IntroductionSectionProps {
  profile: NormalizedProfile;
  roleNarrative: RoleNarrative;
  view: PortfolioView;
  mode?: 'standalone' | 'embedded';
  style: PortfolioStyle;
}

export function IntroductionSection({ profile, roleNarrative, view, mode = 'standalone', style }: IntroductionSectionProps) {
  const heroTitle = profile.name || profile.username;
  const shortBio = roleNarrative.summary || profile.bio?.trim() || 'Building software on the open web.';
  const contactHref = profile.email
    ? `mailto:${profile.email}`
    : profile.website || `https://github.com/${profile.username}`;
  const isEmbedded = mode === 'embedded';
  const styleConfig = getPortfolioStyleConfig(style);

  const quickStats = [
    profile.public_repos > 0
      ? { label: 'Repositories', value: profile.public_repos.toLocaleString() }
      : null,
    profile.followers > 0
      ? { label: 'Followers', value: profile.followers.toLocaleString() }
      : null,
    profile.metrics?.prs_merged
      ? { label: 'Merged PRs', value: profile.metrics.prs_merged.toLocaleString() }
      : null,
    profile.location
      ? { label: 'Based in', value: profile.location }
      : null,
    !profile.followers && profile.created_at
      ? { label: 'Active Since', value: new Date(profile.created_at).getFullYear().toString() }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const socialLinks = [
    {
      icon: <FaGithub className="w-5 h-5" />,
      href: `https://github.com/${profile.username}`,
      label: 'GitHub',
    },
    ...(profile.email
      ? [
          {
            icon: <FaEnvelope className="w-5 h-5" />,
            href: `mailto:${profile.email}`,
            label: 'Email',
          },
        ]
      : []),
    ...(profile.linkedin_url
      ? [
          {
            icon: <FaLinkedin className="w-5 h-5" />,
            href: profile.linkedin_url,
            label: 'LinkedIn',
          },
        ]
      : []),
    ...(profile.twitter_username
      ? [
          {
            icon: <FaXTwitter className="w-5 h-5" />,
            href: `https://twitter.com/${profile.twitter_username}`,
            label: 'Twitter',
          },
        ]
      : []),
    ...(profile.website
      ? [
          {
            icon: <FaGlobe className="w-5 h-5" />,
            href: profile.website,
            label: 'Website',
          },
        ]
      : []),
  ];

  return (
    <div className={`relative w-full ${isEmbedded ? "py-0" : "py-8 sm:py-12 md:py-16"}`}>
      {!isEmbedded && <SectionBorder className="absolute bottom-0 left-0 right-0" />}
      <div className={`flex items-center justify-between ${isEmbedded ? "mb-5 flex-wrap gap-3" : "mb-8"}`}>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <span className={cn("text-xl font-bold", styleConfig.heading)}>
            <span className="font-[var(--font-playfair)] italic">DevFolio</span>
            <span className="font-sans">Gen</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <PortfolioControls />
          <PortfolioDownloadButton username={profile.username} />
          <ShareButton username={profile.username} />
        </div>
      </div>
      <div className={`grid gap-6 ${isEmbedded ? (style === "minimal" ? "xl:grid-cols-[minmax(0,1.2fr)_minmax(240px,300px)]" : "2xl:grid-cols-[minmax(0,1.28fr)_minmax(260px,320px)]") : "lg:grid-cols-[1.55fr_minmax(280px,360px)]"} lg:items-stretch`}>
        <Card className={cn("min-w-0 overflow-hidden shadow-sm", style === "minimal" ? "border-border/80 bg-gradient-to-br from-background via-background to-muted/50" : styleConfig.softCard, isEmbedded && "h-full")}>
          <div className={`flex h-full min-w-0 flex-col ${isEmbedded ? "gap-5 p-6 sm:p-7" : "gap-8 p-6 sm:p-8 md:p-10"}`}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 min-w-0">
                  <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", styleConfig.pill, styleConfig.eyebrow)}>
                    <FaLocationArrow className="h-3.5 w-3.5" />
                    {view === 'recruiter' ? 'Recruiter Snapshot' : 'Portfolio Snapshot'}
                  </div>
                  <div className="space-y-2 min-w-0">
                    <h1 className={cn(`font-bold tracking-tight min-w-0 break-words ${isEmbedded ? "text-[clamp(2.5rem,5vw,4.4rem)] leading-[0.92]" : "text-4xl md:text-6xl"}`, styleConfig.heading, style === "bold" && !isEmbedded && "text-[clamp(3rem,8vw,5.75rem)] leading-[0.9]", style === "developer-dark" && "font-mono")}>
                      {heroTitle}
                    </h1>
                    <p className={cn("text-sm font-medium uppercase tracking-[0.2em] break-all", styleConfig.eyebrow)}>
                      @{profile.username}
                    </p>
                  </div>
                </div>
                <div className={`relative shrink-0 ${isEmbedded ? "hidden sm:block" : ""}`}>
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
                  <Image
                    src={profile.avatar_url}
                    alt={`${profile.name || profile.username}'s Photo`}
                    height={isEmbedded ? 88 : 96}
                    width={isEmbedded ? 88 : 96}
                    className="relative object-cover rounded-full border-4 border-border shadow-sm"
                  />
                </div>
              </div>
              <div className={`min-w-0 ${isEmbedded ? "space-y-3" : "space-y-4"}`}>
                <p className={cn(`leading-relaxed min-w-0 ${isEmbedded ? "max-w-2xl text-[0.98rem] sm:text-base" : "max-w-3xl text-base sm:text-lg md:text-xl"}`, styleConfig.text, style === "developer-dark" && "text-slate-300")}>
                  {shortBio}
                </p>
              </div>
            </div>

            <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3 text-sm", styleConfig.mutedText)}>
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="h-4 w-4 flex-shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.followers > 0 && (
                <div className="flex items-center gap-1.5">
                  <FaUsers className="h-4 w-4 flex-shrink-0" />
                  <span>{profile.followers.toLocaleString()} followers</span>
                </div>
              )}
              {profile.following > 0 && <span>{profile.following.toLocaleString()} following</span>}
            </div>

            <div className={`grid gap-3 ${isEmbedded ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className={cn("rounded-2xl border px-4 py-4 backdrop-blur-sm", styleConfig.statCard)}
                >
                  <div className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                    {stat.label}
                  </div>
                  <div className={cn("mt-2 text-lg font-semibold", styleConfig.heading)}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className={cn("rounded-full px-5", styleConfig.primaryButton)}>
                <a href="#featured-work">
                  View Projects
                  <FaArrowRight className="h-4 w-4" />
                </a>
              </Button>
              {view !== 'recruiter' && (
                <Button asChild variant="secondary" size="lg" className={cn("rounded-full px-5", styleConfig.secondaryButton)}>
                  <a href="#recruiter-view">
                    Hiring Summary
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className={cn("rounded-full px-5", styleConfig.outlineButton)}>
                <a href={contactHref} target={contactHref.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
                  Get in Touch
                </a>
              </Button>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors duration-200 hover:text-foreground", styleConfig.pill, styleConfig.mutedText)}
                    aria-label={link.label}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className={cn(isEmbedded ? "p-5 sm:p-6" : "p-6 sm:p-8", style === "minimal" ? "border-border/80 bg-card/80" : styleConfig.card)}>
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
              <Image
                src={profile.avatar_url}
                alt={`${profile.name || profile.username}'s Photo`}
                height={220}
                width={220}
                className="relative object-cover rounded-full border-4 border-border shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <p className={cn("text-xs font-semibold uppercase tracking-[0.22em]", styleConfig.eyebrow)}>
                At a glance
              </p>
              <p className={cn("text-sm leading-relaxed", styleConfig.mutedText)}>
                Public profile, strongest signals, and the cleanest path to explore the work behind this portfolio.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
