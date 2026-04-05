"use client"

import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/utils/analytics"
import { FaDownload } from "react-icons/fa6"

interface RecruiterBriefDownloadProps {
  filename: string
  content: string
}

export function RecruiterBriefDownload({ filename, content }: RecruiterBriefDownloadProps) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)

    trackEvent("recruiter-brief-downloaded", { filename })
  }

  return (
    <Button onClick={handleDownload} className="gap-2 rounded-full">
      <FaDownload className="h-4 w-4" />
      Download Brief
    </Button>
  )
}
