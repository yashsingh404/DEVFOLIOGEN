"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaCheck, FaCopy } from "react-icons/fa6"

interface CopyProfileLinkButtonProps {
  username: string
}

export function CopyProfileLinkButton({ username }: CopyProfileLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/${username}${window.location.search}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Button variant="outline" size="lg" className="rounded-full px-5" onClick={handleCopy}>
      {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy Profile Link"}
    </Button>
  )
}
