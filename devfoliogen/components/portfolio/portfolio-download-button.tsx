"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { trackEvent } from "@/lib/utils/analytics"
import { FaDownload, FaFileArrowDown, FaPrint } from "react-icons/fa6"

interface PortfolioDownloadButtonProps {
  username: string
}

export function PortfolioDownloadButton({ username }: PortfolioDownloadButtonProps) {
  const downloadHtml = () => {
    const documentHtml = document.documentElement.outerHTML
    const blob = new Blob([`<!DOCTYPE html>\n${documentHtml}`], {
      type: "text/html;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${username}-portfolio.html`
    anchor.click()
    URL.revokeObjectURL(url)

    trackEvent("portfolio-html-downloaded", { username })
  }

  const printPortfolio = () => {
    trackEvent("portfolio-print-started", { username })
    window.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FaDownload className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={downloadHtml} className="cursor-pointer">
          <FaFileArrowDown className="h-4 w-4" />
          Download HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printPortfolio} className="cursor-pointer">
          <FaPrint className="h-4 w-4" />
          Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
