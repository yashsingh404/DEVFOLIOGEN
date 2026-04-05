import { FaGithub, FaEnvelope, FaLinkedin, FaXTwitter, FaGlobe } from 'react-icons/fa6';
import Link from 'next/link';
import type { NormalizedProfile } from '@/types/github';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CopyProfileLinkButton } from './copy-profile-link-button';
import { getPortfolioStyleConfig } from '@/lib/portfolio/style';
import { cn } from '@/lib/utils';
import type { PortfolioStyle } from '@/types/portfolio';

interface GetInTouchSectionProps {
  profile: NormalizedProfile;
  style?: PortfolioStyle;
  compact?: boolean;
}

export function GetInTouchSection({ profile, style = 'minimal', compact = false }: GetInTouchSectionProps) {
  const styleConfig = getPortfolioStyleConfig(style);
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

  if (socialLinks.length === 0) {
    return null;
  }

  const hasExpandedContact = socialLinks.length > 2 || Boolean(profile.email || profile.website);
  const isCompact = compact || !hasExpandedContact;

  return (
    <footer className={cn("border-t", style === "minimal" ? "border-border bg-muted/15" : style === "developer-dark" ? "border-slate-800 bg-transparent" : "border-slate-200 bg-transparent")}>
      <div className={`container mx-auto max-w-6xl px-4 sm:px-6 ${isCompact ? "py-8 sm:py-10" : "py-12 sm:py-16"}`}>
        <Card className={cn("p-6 sm:p-8", style === "minimal" ? "border-border/80 bg-background/80" : styleConfig.card)}>
          <div className={`flex flex-col ${isCompact ? "gap-5" : "gap-8 lg:flex-row lg:items-end lg:justify-between"}`}>
            <div className="max-w-2xl space-y-3">
              <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", styleConfig.eyebrow)}>
                Get In Touch
              </p>
              <h2 className={cn("text-2xl font-bold tracking-tight sm:text-3xl", styleConfig.heading)}>
                {isCompact ? "Follow the work or reach out directly." : "Want to collaborate, hire, or learn more about this work?"}
              </h2>
              <p className={cn("text-sm leading-relaxed sm:text-base", styleConfig.mutedText)}>
                {isCompact
                  ? "A smaller contact block keeps the page tight when only a limited set of public links is available."
                  : "Reach out through any of the links below. This portfolio is generated from live GitHub data, but the conversation behind the work still happens person to person."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {profile.email && (
                <Button asChild size="lg" className={cn("rounded-full px-5", styleConfig.primaryButton)}>
                  <a href={`mailto:${profile.email}`}>Email</a>
                </Button>
              )}
              {profile.website && (
                <Button asChild variant="outline" size="lg" className={cn("rounded-full px-5", styleConfig.outlineButton)}>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </Button>
              )}
              <CopyProfileLinkButton username={profile.username} />
            </div>
          </div>

          <div className={cn(`mt-8 flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between ${isCompact ? "mt-6 pt-5" : ""}`, style === "developer-dark" ? "border-t border-slate-800/80" : "border-t border-border/70")}>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-200 hover:text-foreground", styleConfig.pill, styleConfig.mutedText)}
                  aria-label={link.label}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
            <div className={cn("text-sm", styleConfig.mutedText)}>
              © {new Date().getFullYear()} {profile.name || profile.username}
            </div>
          </div>
        </Card>
      </div>
    </footer>
  );
}
