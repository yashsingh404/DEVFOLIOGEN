'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPortfolioStyleConfig } from "@/lib/portfolio/style"
import { cn } from "@/lib/utils"
import { FaExternalLinkAlt, FaGithub, FaStar, FaCodeBranch, FaChevronDown } from "react-icons/fa"
import type { ProjectsData } from "@/types/github"
import SectionBorder from "./section-border"
import { ProjectImage } from "./project-image"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import type { PortfolioRole, PortfolioStyle } from "@/types/portfolio"
import { describeRoleProject } from "@/lib/portfolio/presentation"

interface WorkGalleryProps {
  projects?: ProjectsData
  role: PortfolioRole
  style: PortfolioStyle
}

export function WorkGallery({ projects, role, style }: WorkGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const styleConfig = getPortfolioStyleConfig(style)

  if (!projects || projects.featured.length === 0) return null

  const visibleProjects = isExpanded ? projects.featured : projects.featured.slice(0, 6)

  return (
    <section id="featured-work" className="relative w-full py-8 sm:py-10 md:py-14">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className={cn("space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 md:px-8", style === "minimal" ? "rounded-[28px] bg-background" : styleConfig.section)}>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className={cn("text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight", styleConfig.heading, style === "bold" && "md:text-6xl")}>Featured Work</h2>
            <p className={cn("mt-2 text-sm sm:text-base", styleConfig.mutedText)}>
              Selected repositories ranked from public GitHub signals, freshness, and project relevance.
            </p>
          </div>
          <div className={cn("rounded-full border px-4 py-2 text-sm", styleConfig.pill, styleConfig.mutedText)}>
            {projects.total_stars.toLocaleString()} stars across {projects.total_repos} repositories
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visibleProjects.map((project, index) => {
            const urlParts = project.url.split('/')
            const owner = urlParts[urlParts.length - 2]
            const repo = urlParts[urlParts.length - 1]
            const fallbackImageUrl = `https://opengraph.githubassets.com/1/${owner}/${repo}`
            
            const imageUrl = project.homepage
              ? `/api/screenshot?url=${encodeURIComponent(project.homepage)}&width=1280&height=800&format=png`
              : fallbackImageUrl

            return (
              <Card 
                key={project.name} 
                className={cn(`group flex h-full flex-col overflow-hidden transition-all duration-300 ${
                  index === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                }`, style === "minimal" ? "border-border bg-card hover:border-primary/30 hover:shadow-lg" : styleConfig.card, style === "bold" && "hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(14,165,233,0.35)]", style === "developer-dark" && "hover:border-emerald-400/30")}
              >
                <div className={cn("relative aspect-video w-full overflow-hidden border-b", style === "minimal" ? "bg-muted border-border" : style === "developer-dark" ? "bg-slate-950 border-slate-800" : "bg-cyan-50 border-cyan-100")}>
                  <ProjectImage 
                    src={imageUrl} 
                    fallbackSrc={fallbackImageUrl}
                    alt={project.name} 
                    title={project.name}
                    language={project.language}
                    stars={project.stars}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <CardContent className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
                  <div className="space-y-3 min-w-0">
                    <div className={cn("flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em]", styleConfig.eyebrow)}>
                      <span>{project.language || "Project"}</span>
                      <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                    </div>
                    <h3 className={cn("text-lg font-bold leading-tight tracking-tight transition-colors sm:text-xl group-hover:text-primary", styleConfig.heading, style === "bold" && "text-xl sm:text-2xl")}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className={cn(`text-sm leading-relaxed ${index === 0 ? "line-clamp-3" : "line-clamp-2"}`, styleConfig.mutedText)}>
                        {project.description}
                      </p>
                    )}
                    <p className={cn("text-xs leading-relaxed", style === "developer-dark" ? "text-emerald-300" : "text-primary/90")}>
                      {describeRoleProject(project, role)}
                    </p>
                  </div>

                  {project.languages && Object.keys(project.languages).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(project.languages)
                        .filter(([lang, value]) => Boolean(lang) && lang.toLowerCase() !== 'unknown' && value > 0)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([lang]) => (
                          <Badge 
                            key={lang} 
                            variant="outline" 
                            className={cn("px-2 py-0.5 text-xs font-medium transition-colors", style === "minimal" ? "border-border/60 hover:border-primary/40 hover:bg-primary/5" : styleConfig.badge)}
                          >
                            {lang}
                          </Badge>
                        ))}
                    </div>
                  )}

                  <div className={cn("flex items-center gap-4 text-sm", styleConfig.mutedText)}>
                    <div className="flex items-center gap-1.5">
                      <FaStar className="h-3.5 w-3.5 text-yellow-500/70" />
                      <span className="font-medium">{project.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaCodeBranch className="h-3.5 w-3.5 text-blue-500/70" />
                      <span className="font-medium">{project.forks.toLocaleString()}</span>
                    </div>
                  </div>

                  {project.topics && project.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.topics.slice(0, index === 0 ? 4 : 3).map((topic) => (
                        <Badge 
                          key={topic} 
                          variant="secondary" 
                          className={cn("px-2.5 py-1 text-xs font-normal transition-colors", style === "minimal" ? "bg-secondary/50 hover:bg-secondary" : styleConfig.badge)}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2 flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className={cn("flex-1 gap-2 text-sm font-medium transition-colors", style === "minimal" ? "hover:bg-primary hover:text-primary-foreground" : styleConfig.outlineButton)}
                    >
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <FaGithub className="h-4 w-4" />
                        Source
                      </a>
                    </Button>
                    {project.homepage && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className={cn("flex-1 gap-2 text-sm font-medium", styleConfig.primaryButton)}
                      >
                        <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                          <FaExternalLinkAlt className="h-4 w-4" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {projects.featured.length > 6 && (
          <div className="flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("group flex w-full items-center justify-center gap-2 rounded-md border-2 px-6 py-3 transition-colors sm:w-auto", style === "minimal" ? "border-border hover:border-primary/20 hover:bg-muted/50" : styleConfig.outlineButton)}
            >
              <FaChevronDown 
                className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                {isExpanded ? 'Show less' : `Show all ${projects.featured.length} projects`}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
