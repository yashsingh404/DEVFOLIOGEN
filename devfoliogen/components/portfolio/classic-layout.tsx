import { cn } from "@/lib/utils"
import { getPortfolioStyleConfig } from "@/lib/portfolio/style"
import { IntroductionSection } from "@/components/portfolio/introduction-section"
import { CapabilitiesSection } from "@/components/portfolio/capabilities-section"
import { WorkGallery } from "@/components/portfolio/work-gallery"
import { ProofOfWorkSection } from "@/components/portfolio/proof-of-work-section"
import { WorkExperienceSection } from "@/components/portfolio/work-experience-section"
import { PRsByOrgSection } from "@/components/portfolio/prs-by-org-section"
import { GetInTouchSection } from "@/components/portfolio/get-in-touch-section"
import { TopLanguagesSection } from "@/components/portfolio/top-languages-section"
import DiagonalPattern from "@/components/portfolio/diagonal-pattern"
import SectionBorder from "@/components/portfolio/section-border"
import type { NormalizedProfile } from "@/types/github"
import type { AboutData } from "@/types/portfolio"
import type { ProjectsData } from "@/types/github"
import type { PRByOrg } from "@/components/portfolio/prs-by-org-section"
import type { PortfolioStyle, PortfolioView, RecruiterBrief, RecruiterSignals, RoleNarrative, TimelineEvent } from "@/types/portfolio"
import { RecruiterViewSection } from "@/components/portfolio/recruiter-view-section"

interface ClassicLayoutProps {
  profile: NormalizedProfile
  about: AboutData | null
  projects?: ProjectsData
  username: string
  prsByOrg: PRByOrg[]
  roleNarrative: RoleNarrative
  timeline: TimelineEvent[]
  recruiterBrief: RecruiterBrief
  recruiterSignals: RecruiterSignals
  recruiterBriefText: string
  view: PortfolioView
  style: PortfolioStyle
}

export function ClassicLayout({
  profile,
  about,
  projects,
  username,
  prsByOrg,
  roleNarrative,
  timeline,
  recruiterBrief,
  recruiterSignals,
  recruiterBriefText,
  view,
  style,
}: ClassicLayoutProps) {
  const styleConfig = getPortfolioStyleConfig(style)

  return (
    <div className={cn("min-h-screen relative", styleConfig.page)}>
      <DiagonalPattern side="left" />
      <DiagonalPattern side="right" />

      <main className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        <IntroductionSection profile={profile} roleNarrative={roleNarrative} view={view} mode="standalone" style={style} />

        <RecruiterViewSection
          brief={recruiterBrief}
          signals={recruiterSignals}
          briefText={recruiterBriefText}
          username={username}
          style={style}
        />
        
        <WorkExperienceSection profile={profile} />
        
        <CapabilitiesSection about={about} roleNarrative={roleNarrative} style={style} />
        
        <WorkGallery projects={projects} role={roleNarrative.id} style={style} />

        <section className="relative w-full py-6 sm:py-8 md:py-12">
          <SectionBorder className="absolute bottom-0 left-0 right-0" />
          <TopLanguagesSection languages={projects?.languages} variant="classic" style={style} />
        </section>

        <ProofOfWorkSection username={username} timeline={timeline} style={style} />

        <PRsByOrgSection prsByOrg={prsByOrg} username={username} />
      </main>

      <GetInTouchSection profile={profile} style={style} />
    </div>
  )
}
