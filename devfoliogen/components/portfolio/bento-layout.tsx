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
import { Card } from "@/components/ui/card"
import type { NormalizedProfile } from "@/types/github"
import type { AboutData } from "@/types/portfolio"
import type { ProjectsData } from "@/types/github"
import type { PRByOrg } from "@/components/portfolio/prs-by-org-section"
import type { PortfolioStyle, PortfolioView, RecruiterBrief, RecruiterSignals, RoleNarrative, TimelineEvent } from "@/types/portfolio"
import { RecruiterViewSection } from "@/components/portfolio/recruiter-view-section"

interface BentoLayoutProps {
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

export function BentoLayout({
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
}: BentoLayoutProps) {
  const hasWorkExperience = !!profile.company
  const styleConfig = getPortfolioStyleConfig(style)
  const surfaceClassName = cn(
    "border backdrop-blur-sm transition-colors shadow-lg hover:shadow-xl dark:shadow-none overflow-hidden",
    styleConfig.card
  )

  return (
    <div className={cn("min-h-screen p-4 sm:p-6 lg:p-8", styleConfig.page)}>
      <div className={cn("mx-auto grid max-w-[1500px] grid-cols-1 gap-4 auto-rows-min rounded-[36px] border p-3 md:grid-cols-3 lg:grid-cols-5 sm:p-4", styleConfig.canvas)}>
        
        {/* Profile / Intro - Large Card */}
        <Card className={cn("col-span-1 row-span-2 min-w-0 p-5 sm:p-6 md:col-span-2 lg:col-span-3", surfaceClassName, style === "bold" && "bg-gradient-to-br from-white via-white to-cyan-50/80")}>
          <IntroductionSection profile={profile} roleNarrative={roleNarrative} view={view} mode="embedded" style={style} />
        </Card>

        {/* Work Experience or Top Languages - Beside Hero */}
        {hasWorkExperience ? (
          <Card className={cn("col-span-1 row-span-2 min-w-0 max-h-[600px] overflow-y-auto p-5 sm:p-6 md:col-span-1 lg:col-span-2", surfaceClassName, style === "developer-dark" && "bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30")}>
            <WorkExperienceSection profile={profile} />
          </Card>
        ) : (
          <div className="col-span-1 row-span-2 min-w-0 md:col-span-1 lg:col-span-2">
            <TopLanguagesSection languages={projects?.languages} style={style} />
          </div>
        )}

        {/* Capabilities / Skills - Wide Card */}
        <Card className={cn("col-span-1 p-6 md:col-span-3 lg:col-span-5", surfaceClassName)}>
          <CapabilitiesSection about={about} roleNarrative={roleNarrative} style={style} />
        </Card>

        <div className="col-span-1 md:col-span-3 lg:col-span-5">
          <RecruiterViewSection
            brief={recruiterBrief}
            signals={recruiterSignals}
            briefText={recruiterBriefText}
            username={username}
            style={style}
          />
        </div>

        {/* Projects - Grid within Grid */}
        <div className="col-span-1 md:col-span-3 lg:col-span-5">
           <WorkGallery projects={projects} role={roleNarrative.id} style={style} />
        </div>

        {/* Top Languages - Below Featured Work (only when work experience exists) */}
        {hasWorkExperience && (
          <div className="col-span-1 min-w-0 row-span-2 md:col-span-3 lg:col-span-5">
            <TopLanguagesSection languages={projects?.languages} style={style} />
          </div>
        )}

        {/* Proof of Work */}
        <Card className={cn("col-span-1 min-w-0 p-5 sm:p-6 md:col-span-3 lg:col-span-5", surfaceClassName)}>
          <ProofOfWorkSection username={username} timeline={timeline} style={style} />
        </Card>

        {/* PRs */}
        <Card className={cn("col-span-1 p-6 md:col-span-3 lg:col-span-5", surfaceClassName)}>
           <PRsByOrgSection prsByOrg={prsByOrg} username={username} />
        </Card>

        {/* Contact - Footer Card */}
        <Card className={cn("col-span-1 p-6 md:col-span-3 lg:col-span-5", surfaceClassName)}>
          <GetInTouchSection profile={profile} style={style} compact />
        </Card>

      </div>
    </div>
  )
}
