'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPortfolioStyleConfig } from "@/lib/portfolio/style"
import { cn } from "@/lib/utils"
import type { PortfolioStyle } from "@/types/portfolio"

interface TopLanguagesSectionProps {
  languages?: { [key: string]: number }
  variant?: 'classic' | 'bento'
  style?: PortfolioStyle
}

export function TopLanguagesSection({ languages, variant = 'bento', style = 'minimal' }: TopLanguagesSectionProps) {
  const filteredLanguages = Object.entries(languages || {})
    .filter(([language, bytes]) => Boolean(language) && language.toLowerCase() !== 'unknown' && bytes > 0)
  const styleConfig = getPortfolioStyleConfig(style)

  if (filteredLanguages.length === 0) return null

  const totalBytes = filteredLanguages.reduce((sum, [, bytes]) => sum + bytes, 0)
  const isAnimated = variant === 'bento'

  const cardClassName = isAnimated
    ? cn("h-full flex flex-col backdrop-blur-sm transition-colors shadow-lg hover:shadow-xl dark:shadow-none", style === "minimal" ? "bg-card/50 border-border/50 hover:border-primary/50" : styleConfig.card)
    : cn("h-full flex flex-col", style === "minimal" ? "border-border" : styleConfig.card)

  const badgeClassName = isAnimated
    ? cn("cursor-default px-3 py-1.5 text-sm font-medium transition-all duration-200", style === "minimal" ? "bg-secondary/80 hover:bg-secondary hover:scale-105" : styleConfig.badge)
    : cn("cursor-default px-3 py-1.5 text-sm font-medium transition-colors", style === "minimal" ? "bg-secondary/80 hover:bg-secondary" : styleConfig.badge)

  return (
    <Card className={cardClassName}>
      <CardContent className="p-6 flex flex-col justify-center h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className={cn("text-lg sm:text-xl font-bold tracking-tight", styleConfig.heading)}>Top Languages</h3>
          <span className={cn("text-xs sm:text-sm", styleConfig.mutedText)}>
            {filteredLanguages.length} languages
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {filteredLanguages
            .sort(([, a], [, b]) => b - a)
            .slice(0, 12)
            .map(([lang, bytes]) => {
              const percentage = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : 0
              return (
                <Badge 
                  key={lang} 
                  variant="secondary" 
                  className={badgeClassName}
                  title={`${percentage}% of code`}
                >
                  {lang}
                </Badge>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
