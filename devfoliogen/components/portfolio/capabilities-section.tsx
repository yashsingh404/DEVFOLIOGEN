import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getPortfolioStyleConfig } from "@/lib/portfolio/style"
import { cn } from "@/lib/utils"
import type { AboutData } from "@/types/github"
import type { PortfolioStyle, RoleNarrative } from "@/types/portfolio"
import SectionBorder from "./section-border"

interface CapabilitiesSectionProps {
  about?: AboutData | null
  roleNarrative: RoleNarrative
  style: PortfolioStyle
}

export function CapabilitiesSection({ about, roleNarrative, style }: CapabilitiesSectionProps) {
  const narrative = about?.summary || roleNarrative.summary
  const highlights = about?.highlights?.length ? about.highlights : roleNarrative.highlights
  const skills = about?.skills?.length ? about.skills : roleNarrative.skills
  const styleConfig = getPortfolioStyleConfig(style)

  if (!narrative && highlights.length === 0 && skills.length === 0) return null

  return (
    <section id="about" className="relative w-full py-8 sm:py-12 md:py-16">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className={cn("space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 md:space-y-12 md:px-8", style === "minimal" ? "rounded-[28px] bg-muted/[0.22]" : styleConfig.sectionMuted)}>
        <div>
          <h2 className={cn("mb-2 font-bold tracking-tight text-3xl md:text-5xl", styleConfig.heading, style === "bold" && "text-4xl md:text-6xl")}>
            About
          </h2>
          <p className={cn("mt-2 max-w-2xl text-sm sm:text-base", styleConfig.mutedText)}>
            A concise profile summary, strongest signals, and technical focus inferred from public work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 sm:gap-8">
          {narrative && (
            <Card className={cn(style === "minimal" ? "border-border bg-card/70" : styleConfig.card)}>
              <CardContent className="p-6 sm:p-8">
                <h3 className={cn("mb-5 text-sm font-semibold uppercase tracking-wider sm:text-base", styleConfig.eyebrow)}>
                  Narrative
                </h3>
                <p className={cn("text-base leading-relaxed sm:text-lg", styleConfig.text)}>
                  {narrative}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
          {highlights && highlights.length > 0 && (
            <Card className={cn(style === "minimal" ? "border-border bg-card/70" : styleConfig.card)}>
              <CardContent className="p-6 sm:p-8">
                <h3 className={cn("mb-6 text-sm font-semibold uppercase tracking-wider sm:text-base", styleConfig.eyebrow)}>
                  Highlights
                </h3>
                <ul className="space-y-4">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className={cn("flex-1 text-sm leading-relaxed sm:text-base", styleConfig.text)}>
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {skills && skills.length > 0 && (
            <Card className={cn(style === "minimal" ? "border-border bg-card/70" : styleConfig.card)}>
              <CardContent className="p-6 sm:p-8">
                <h3 className={cn("mb-6 text-sm font-semibold uppercase tracking-wider sm:text-base", styleConfig.eyebrow)}>
                  Technical Focus
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className={cn("px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm", style === "minimal" ? "bg-secondary/60 hover:bg-secondary/80" : styleConfig.badge)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </section>
  )
}
