"use client";

import React from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import { Card, CardContent } from '@/components/ui/card';
import { getPortfolioStyleConfig } from '@/lib/portfolio/style';
import { cn } from '@/lib/utils';
import SectionBorder from './section-border';
import type { PortfolioStyle, TimelineEvent } from '@/types/portfolio';
import { format } from 'date-fns';
import Link from 'next/link';

interface ProofOfWorkSectionProps {
  username: string;
  timeline: TimelineEvent[];
  style?: PortfolioStyle;
}

export function ProofOfWorkSection({ username, timeline, style = 'minimal' }: ProofOfWorkSectionProps) {
  const [mounted, setMounted] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const styleConfig = getPortfolioStyleConfig(style);

  React.useEffect(() => {
    setMounted(true);
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const theme = {
    light: ['#edf2f7', '#b7f5c6', '#63dd8c', '#2fb164', '#167c3d'],
    dark: ['#111827', '#0f5132', '#15803d', '#22c55e', '#86efac'],
  };

  const isMobile = dimensions.width < 640;
  const isTablet = dimensions.width >= 640 && dimensions.width < 1024;

  const blockSize = isMobile ? 11 : isTablet ? 14 : 16;
  const blockMargin = isMobile ? 2 : isTablet ? 4 : 5;
  const fontSize = isMobile ? 10 : isTablet ? 12 : 13;

  if (!mounted) {
    return (
      <section className="relative w-full py-8 sm:py-12 md:py-16">
        <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className={cn("space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 md:px-8", style === "minimal" ? "rounded-[28px] bg-muted/[0.18]" : styleConfig.sectionMuted)}>
        <div>
          <h2 className={cn("font-bold tracking-tight text-3xl md:text-5xl", styleConfig.heading)}>
            Proof of Work
          </h2>
          <p className={cn("mt-1 mb-4", styleConfig.mutedText)}>
            A live contribution graph paired with timeline moments that explain how the portfolio has evolved.
          </p>
        </div>
          <Card className={cn(style === "minimal" ? "border-border" : styleConfig.card)}>
            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
              <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-muted/50 animate-pulse rounded-md" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className={cn("font-bold tracking-tight text-2xl md:text-4xl", styleConfig.heading, style === "bold" && "md:text-5xl")}>
            Proof of Work
          </h2>
          <p className={cn("mt-1 mb-4", styleConfig.mutedText)}>
            A live contribution graph paired with timeline moments that explain how the portfolio has evolved.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.85fr)]">
          <Card className={cn(style === "minimal" ? "border-border" : styleConfig.card)}>
            <CardContent className="p-3 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className={`${isMobile ? "min-w-[600px]" : "w-full"} flex justify-start xl:justify-center`}>
                  <GitHubCalendar
                    username={username}
                    fontSize={fontSize}
                    blockSize={blockSize}
                    blockMargin={blockMargin}
                    showWeekdayLabels={!isMobile}
                    colorScheme="light"
                    theme={{
                      light: theme.light,
                      dark: theme.dark,
                    }}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                    }}
                  />
                </div>
                <p className={cn("mt-4 text-sm", styleConfig.mutedText)}>
                  Empty days stay cool grey, while any contribution lights up in visible greens so activity is readable even for smaller portfolios.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(style === "minimal" ? "border-border" : styleConfig.card)}>
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-5">
                <div>
                  <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                    Timeline
                  </p>
                  <p className={cn("mt-2 text-sm leading-relaxed", styleConfig.mutedText)}>
                    Milestones that help recruiters and collaborators understand momentum, validation, and current direction.
                  </p>
                </div>
                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div key={`${event.date}-${event.title}`} className={cn("relative border-l pl-4", style === "developer-dark" ? "border-slate-700" : "border-border")}>
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <p className={cn("text-xs font-semibold uppercase tracking-[0.14em]", styleConfig.eyebrow)}>
                        {format(new Date(event.date), 'MMM yyyy')}
                      </p>
                      <h3 className={cn("mt-1 text-sm font-semibold sm:text-base", styleConfig.heading)}>
                        {event.title}
                      </h3>
                      <p className={cn("mt-1 text-sm leading-relaxed", styleConfig.mutedText)}>
                        {event.description}
                      </p>
                      {event.href && (
                        <Link
                          href={event.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn("mt-2 inline-flex text-sm font-medium hover:underline", style === "developer-dark" ? "text-emerald-300" : "text-primary")}
                        >
                          Open proof point
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
