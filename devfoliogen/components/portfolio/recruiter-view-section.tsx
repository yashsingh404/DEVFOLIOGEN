import { Card, CardContent } from "@/components/ui/card"
import { getPortfolioStyleConfig } from "@/lib/portfolio/style"
import { cn } from "@/lib/utils"
import type { PortfolioStyle, RecruiterBrief, RecruiterSignals } from "@/types/portfolio"
import SectionBorder from "./section-border"
import { RecruiterBriefDownload } from "./recruiter-brief-download"

interface RecruiterViewSectionProps {
  brief: RecruiterBrief
  signals: RecruiterSignals
  briefText: string
  username: string
  style: PortfolioStyle
}

export function RecruiterViewSection({
  brief,
  signals,
  briefText,
  username,
  style,
}: RecruiterViewSectionProps) {
  const styleConfig = getPortfolioStyleConfig(style)
  const metricCards = [
    { label: "Years Active", value: `${signals.activeYears}+` },
    { label: "Repo Count", value: signals.repoCount.toLocaleString(), show: signals.repoCount > 0 },
    { label: "Total Stars", value: signals.totalStars.toLocaleString(), show: signals.totalStars > 0 },
    { label: "External PRs", value: signals.externalPRs.toLocaleString(), show: signals.externalPRs > 0 },
    { label: "Recent Activity", value: signals.lastActiveLabel, show: true },
  ].filter(metric => metric.show !== false);

  return (
    <section id="recruiter-view" className="relative w-full py-8 sm:py-12 md:py-16">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className={cn("space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 md:px-8", style === "minimal" ? "rounded-[28px] bg-muted/[0.22]" : styleConfig.sectionMuted)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", styleConfig.eyebrow)}>
              Hiring Summary
            </p>
            <h2 className={cn("text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl", styleConfig.heading, style === "bold" && "md:text-6xl")}>
              Fast candidate brief for sharing and outreach
            </h2>
            <p className={cn("max-w-3xl text-sm sm:text-base", styleConfig.mutedText)}>
              A compressed, scan-first version of the portfolio designed for hiring conversations and referrals.
            </p>
          </div>
          <RecruiterBriefDownload
            filename={`${username}-candidate-brief.txt`}
            content={briefText}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className={cn(style === "minimal" ? "border-border bg-card/70" : styleConfig.card)}>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2">
                <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                  Top Fit
                </p>
                <h3 className={cn("text-xl font-semibold tracking-tight", styleConfig.heading)}>
                  {brief.headline}
                </h3>
                <p className={cn("text-sm leading-relaxed sm:text-base", styleConfig.text)}>
                  {brief.topFit}
                </p>
              </div>

              <div className="space-y-3">
                <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                  Hiring Signals
                </p>
                <ul className="space-y-3">
                  {brief.impactBullets.map((item) => (
                    <li key={item} className={cn("flex items-start gap-3 text-sm sm:text-base", styleConfig.text)}>
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(style === "minimal" ? "border-border bg-card/70" : styleConfig.card)}>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-3">
                {metricCards.map((metric) => (
                  <div key={metric.label} className={cn("rounded-2xl border px-4 py-4", styleConfig.statCard)}>
                    <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                      {metric.label}
                    </p>
                    <p className={cn("mt-2 text-lg font-semibold", styleConfig.heading)}>{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                  Focus Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {brief.focusAreas.map((item) => (
                    <span
                      key={item}
                      className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", styleConfig.pill, styleConfig.heading)}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {brief.projects.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-3">
            {brief.projects.map((project) => (
              <Card key={project.name} className={cn(style === "minimal" ? "border-border bg-card/70" : styleConfig.card)}>
                <CardContent className="space-y-3 p-5">
                  <div>
                    <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styleConfig.eyebrow)}>
                      Selected Project
                    </p>
                    <h3 className={cn("mt-2 text-lg font-semibold", styleConfig.heading)}>{project.name}</h3>
                  </div>
                  <p className={cn("text-sm leading-relaxed", styleConfig.mutedText)}>{project.reason}</p>
                  <div className={cn("flex items-center justify-between text-sm", styleConfig.text)}>
                    <span>{project.language || "Generalist"}</span>
                    <span>{project.stars.toLocaleString()} stars</span>
                  </div>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("inline-flex text-sm font-medium hover:underline", style === "developer-dark" ? "text-emerald-300" : "text-primary")}
                  >
                    Open repository
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
