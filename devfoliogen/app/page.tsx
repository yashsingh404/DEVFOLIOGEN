"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FaGithub, FaStar, FaArrowRight, FaCheckCircle, FaCodeBranch } from "react-icons/fa"
import Link from "next/link"
import { trackEvent } from "@/lib/utils/analytics"
import { useDebounce } from "@/lib/utils/debounce"
import { useSession } from "@/lib/auth-client"
import type { NormalizedProfile } from "@/types/github"
import type { PortfolioRole } from "@/types/portfolio"

const ROLE_OPTIONS: Array<{ value: PortfolioRole; label: string; description: string }> = [
  { value: "fullstack", label: "Full-Stack", description: "Balanced product, frontend, backend, and shipping signals." },
  { value: "frontend", label: "Frontend", description: "Emphasize UI quality, interaction work, and polished product surfaces." },
  { value: "backend", label: "Backend", description: "Emphasize APIs, systems thinking, infrastructure, and data work." },
  { value: "ai", label: "AI", description: "Emphasize LLM workflows, AI projects, experimentation, and applied intelligence." },
]

const STYLE_OPTIONS = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean editorial layout with a calm, professional feel.",
    layout: "classic",
    accent: "from-slate-200/70 to-white/70",
  },
  {
    value: "bold",
    label: "Bold",
    description: "High-contrast modular cards that feel product-forward.",
    layout: "bento",
    accent: "from-cyan-300/70 to-blue-500/50",
  },
  {
    value: "developer-dark",
    label: "Developer-dark",
    description: "Sharper, denser presentation with a darker engineering vibe.",
    layout: "bento",
    accent: "from-slate-900/80 to-emerald-500/40",
  },
] as const

const GENERATION_STEPS = [
  "Fetching repositories",
  "Analyzing stack",
  "Generating portfolio",
]

type StyleOption = (typeof STYLE_OPTIONS)[number]["value"]
type PreviewRepo = {
  name: string
  stars: number
  language: string | null
}

export default function LandingPage() {
  const repositoryUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "https://github.com/nishantmishra/devfoliogen"
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previewUser, setPreviewUser] = useState<NormalizedProfile | null>(null)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)
  const [starCount, setStarCount] = useState(0)
  const [isRoleSpecific, setIsRoleSpecific] = useState(false)
  const [selectedRole, setSelectedRole] = useState<PortfolioRole>("fullstack")
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>("minimal")
  const [previewRepos, setPreviewRepos] = useState<PreviewRepo[]>([])
  const [portfolioCount, setPortfolioCount] = useState(12400)
  const [generationStep, setGenerationStep] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending: isSessionPending } = useSession()

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('/api/github/stars')
        if (response.ok) {
          const data = await response.json()
          setStarCount(data.stars || 0)
        }
      } catch {
        setStarCount(0)
      }
    }

    fetchStarCount()
  }, [])

  useEffect(() => {
    if (!session?.user || isSessionPending) {
      return;
    }

    if (pathname !== "/") {
      return;
    }

    const redirectToPortfolio = async () => {
      try {
        const response = await fetch("/api/auth/get-github-username");
        if (response.ok) {
          const data = await response.json();
          if (data.username) {
            router.push(`/${data.username}`);
          }
        }
      } catch {
      }
    };

    const timeoutId = setTimeout(() => {
      redirectToPortfolio();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [session, isSessionPending, router, pathname])

  useEffect(() => {
    const target = 12400 + Math.min(starCount * 7, 1900)
    const duration = 1200
    const steps = 48
    const increment = (target - 11800) / steps
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep += 1
      const nextValue = Math.min(Math.round(11800 + increment * currentStep), target)
      setPortfolioCount(nextValue)

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [starCount])

  const debouncedUsername = useDebounce(username.trim(), 500)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!debouncedUsername || debouncedUsername.length < 1) {
      setPreviewUser(null)
      setPreviewRepos([])
      setIsFetchingPreview(false)
      return
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsFetchingPreview(true)

    const fetchPreview = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${debouncedUsername}`, {
          headers: {
            Accept: "application/vnd.github+json",
          },
          signal: abortController.signal,
        })

        if (abortController.signal.aborted) {
          return
        }

        if (response.ok) {
          const data = await response.json()
          const reposResponse = await fetch(`https://api.github.com/users/${debouncedUsername}/repos?sort=updated&per_page=6`, {
            headers: {
              Accept: "application/vnd.github+json",
            },
            signal: abortController.signal,
          })

          const reposData = reposResponse.ok ? await reposResponse.json() : []
          setPreviewUser({
            username: data.login,
            name: data.name,
            bio: data.bio,
            avatar_url: data.avatar_url,
            location: data.location,
            email: data.email,
            website: data.blog || null,
            twitter_username: data.twitter_username,
            company: data.company,
            followers: data.followers,
            following: data.following,
            public_repos: data.public_repos,
            created_at: data.created_at,
          })
          setPreviewRepos(
            reposData
              .filter((repo: { fork: boolean }) => !repo.fork)
              .slice(0, 4)
              .map((repo: { name: string; stargazers_count: number; language: string | null }) => ({
                name: repo.name,
                stars: repo.stargazers_count,
                language: repo.language,
              }))
          )
        } else {
          setPreviewUser(null)
          setPreviewRepos([])
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        setPreviewUser(null)
        setPreviewRepos([])
      } finally {
        if (!abortController.signal.aborted) {
          setIsFetchingPreview(false)
        }
      }
    }

    fetchPreview()

    return () => {
      abortController.abort()
    }
  }, [debouncedUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    const selectedStyleConfig = STYLE_OPTIONS.find((option) => option.value === selectedStyle)

    trackEvent('portfolio-generation-started', {
      username: username.trim(),
      roleSpecific: isRoleSpecific,
      selectedRole: isRoleSpecific ? selectedRole : "general",
      selectedStyle,
    })

    setIsLoading(true)
    setGenerationStep(0)
    const params = new URLSearchParams()
    if (isRoleSpecific) {
      params.set("role", selectedRole)
    }
    params.set("style", selectedStyle)
    if (selectedStyleConfig?.layout === "bento") {
      params.set("layout", "bento")
    }
    const query = params.toString()

    window.setTimeout(() => setGenerationStep(1), 650)
    window.setTimeout(() => setGenerationStep(2), 1350)
    window.setTimeout(() => {
      router.push(query ? `/${username.trim()}?${query}` : `/${username.trim()}`)
    }, 2100)
  }

  const selectedRoleLabel = ROLE_OPTIONS.find((option) => option.value === selectedRole)?.label || "Full-Stack"
  const generationProgress = ((generationStep + (isLoading ? 1 : 0)) / GENERATION_STEPS.length) * 100

  return (
    <div className="min-h-screen flex flex-col text-foreground bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_22%),linear-gradient(180deg,#17417a_0%,#235d95_28%,#3a79aa_54%,#5b8fb8_74%,#6f97b8_100%)]">
      <main className="flex-1">
        <section className="relative mx-auto min-h-screen w-full">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-[-8%] top-[12%] h-72 w-72 rounded-full bg-cyan-300/18 blur-3xl" />
            <div className="absolute right-[-6%] top-[18%] h-80 w-80 rounded-full bg-blue-900/28 blur-3xl" />
            <div className="absolute bottom-[8%] left-[8%] h-72 w-72 rounded-full bg-sky-200/14 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-15" />
          </div>

          <div className="relative flex min-h-[100dvh] w-full px-5 pb-16 pt-24 md:px-[50px]">
            <div className="flex w-full items-center justify-center">
              <div className="flex w-full flex-col items-center justify-center">
                <div className="z-10 flex w-full max-w-6xl flex-col items-center justify-center gap-8 md:gap-10">
                  <header className="w-full max-w-5xl rounded-full border border-white/20 bg-white/8 px-5 py-4 backdrop-blur-2xl">
                    <div className="flex items-center justify-between gap-4">
                      <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                        <span className="text-lg font-bold text-white md:text-2xl">
                          <span className="font-[var(--font-playfair)] italic font-normal">DevFolio</span>
                          <span className="font-sans">Gen</span>
                        </span>
                      </Link>
                      <div className="hidden items-center gap-3 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-sm text-white/80 md:flex">
                        <FaCheckCircle className="h-3.5 w-3.5 text-emerald-300" />
                        <span>{portfolioCount.toLocaleString()} portfolios generated</span>
                      </div>
                      <div className="rounded-full border border-white/15 bg-black/10 px-4 py-2 text-sm text-white/75">
                        AI portfolio generator
                      </div>
                    </div>
                  </header>

                  <div className="flex w-full flex-col items-center justify-center text-center">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-xl">
                      Build once, share anywhere
                    </div>
                    <div className="flex flex-col items-center gap-3 md:gap-6">
                      <div className="flex flex-col items-center gap-3">
                        <h1 className="max-w-5xl text-6xl font-bold leading-none text-white md:text-[6.5rem]">
                          <span className="font-[var(--font-playfair)] italic font-normal">DevFolio</span>
                          <span className="font-sans">Gen</span>
                        </h1>
                      </div>
                      <p className="max-w-3xl px-5 text-lg font-medium tracking-[0.01em] text-white/82 md:px-10 md:text-[1.85rem]">
                        Turn your GitHub profile into a portfolio that feels designed, personal, and ready to share.
                      </p>
                    </div>
                  </div>

                  <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Live Preview</p>
                      <p className="mt-2 text-sm text-white/85">Avatar, follower signal, and top repos appear before generation.</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Hidden Tailoring</p>
                      <p className="mt-2 text-sm text-white/85">Quietly optimize for a target role without exposing it on the final page.</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Portable Output</p>
                      <p className="mt-2 text-sm text-white/85">Share it live, save it as PDF, or download the portfolio as HTML.</p>
                    </div>
                  </div>

                  <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                    <div className="relative group w-full">
                      <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-white/20 via-sky-200/20 to-pink-200/25 blur opacity-40 transition duration-1000 group-hover:opacity-70 group-hover:duration-200" />
                      <Card className="relative overflow-hidden rounded-[28px] border border-white/25 bg-white/12 shadow-2xl backdrop-blur-2xl">
                        <CardContent className="p-5 sm:p-7">
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                                Generator
                              </p>
                              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                                Build your portfolio in one flow
                              </h2>
                              <p className="text-sm leading-relaxed text-white/75 sm:text-base">
                                Paste a GitHub username, optionally tailor the output for a target role, and generate a portfolio that can be downloaded or shared instantly.
                              </p>
                            </div>

                            <div className="relative">
                              {previewUser ? (
                                <Image
                                  src={previewUser.avatar_url}
                                  alt={previewUser.username}
                                  width={28}
                                  height={28}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20"
                                />
                              ) : (
                                <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                              )}
                              <Input
                                placeholder="github-username"
                                className="h-12 rounded-2xl border border-white/20 bg-black/10 pl-12 text-white placeholder:text-white/45 shadow-[0_0_0_0_rgba(103,232,249,0)] transition-all focus-visible:border-cyan-200/70 focus-visible:ring-2 focus-visible:ring-cyan-200/35 focus-visible:shadow-[0_0_28px_rgba(103,232,249,0.18)]"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-white">Portfolio style</p>
                                  <p className="text-xs text-white/65">Set the visual direction before generation.</p>
                                </div>
                                <div className="rounded-full border border-white/15 bg-black/10 px-3 py-1 text-xs text-white/75">
                                  {STYLE_OPTIONS.find((option) => option.value === selectedStyle)?.label}
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-3">
                                {STYLE_OPTIONS.map((style) => (
                                  <button
                                    key={style.value}
                                    type="button"
                                    onClick={() => setSelectedStyle(style.value)}
                                    className={`rounded-2xl border p-3 text-left transition-all ${
                                      selectedStyle === style.value
                                        ? "border-white/60 bg-white text-slate-900 shadow-lg"
                                        : "border-white/15 bg-black/10 text-white hover:border-white/35"
                                    }`}
                                  >
                                    <div className={`mb-3 h-24 rounded-xl bg-gradient-to-br ${style.accent} p-2`}>
                                      {style.value === "minimal" && (
                                        <div className="h-full rounded-lg bg-white p-3">
                                          <div className="h-2 w-1/2 rounded-full bg-slate-300" />
                                          <div className="mt-4 space-y-2">
                                            <div className="h-2 rounded-full bg-slate-200" />
                                            <div className="h-2 w-4/5 rounded-full bg-slate-200" />
                                          </div>
                                          <div className="mt-4 grid grid-cols-2 gap-2">
                                            <div className="h-6 rounded-md border border-slate-200" />
                                            <div className="h-6 rounded-md border border-slate-200" />
                                          </div>
                                        </div>
                                      )}
                                      {style.value === "bold" && (
                                        <div className="h-full rounded-lg bg-slate-950 p-3">
                                          <div className="h-3 w-2/3 rounded-full bg-cyan-300" />
                                          <div className="mt-3 h-5 w-4/5 rounded-md bg-white/90" />
                                          <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="h-8 rounded-lg bg-blue-500/60" />
                                            <div className="h-8 rounded-lg bg-cyan-300/60" />
                                          </div>
                                        </div>
                                      )}
                                      {style.value === "developer-dark" && (
                                        <div className="h-full rounded-lg border border-emerald-400/20 bg-[#09111f] p-3 font-mono">
                                          <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                          </div>
                                          <div className="mt-3 h-2 w-3/5 rounded-full bg-emerald-300/70" />
                                          <div className="mt-2 space-y-1.5">
                                            <div className="h-1.5 rounded-full bg-white/15" />
                                            <div className="h-1.5 w-5/6 rounded-full bg-white/12" />
                                          </div>
                                          <div className="mt-3 h-6 w-1/2 rounded-md bg-emerald-400/15" />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm font-semibold">{style.label}</p>
                                    <p className={`mt-1 text-xs leading-relaxed ${selectedStyle === style.value ? "text-slate-700" : "text-white/65"}`}>
                                      {style.description}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-4">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-semibold text-white">Role-aware generation</p>
                                    <p className="text-xs text-white/65">
                                      {isRoleSpecific ? `Tailoring for: ${selectedRoleLabel} Developer` : "General portfolio with no hidden tailoring"}
                                    </p>
                                  </div>
                                  <div className="flex rounded-full border border-white/15 bg-white/10 p-1">
                                    <button
                                      type="button"
                                      onClick={() => setIsRoleSpecific(false)}
                                      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${!isRoleSpecific ? "bg-white text-slate-900" : "text-white/80"}`}
                                    >
                                      General
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setIsRoleSpecific(true)}
                                      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${isRoleSpecific ? "bg-white text-slate-900" : "text-white/80"}`}
                                    >
                                      Tailored
                                    </button>
                                  </div>
                                </div>

                                {isRoleSpecific && (
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {ROLE_OPTIONS.map((role) => (
                                      <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setSelectedRole(role.value)}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                          selectedRole === role.value
                                            ? "border-white/60 bg-white text-slate-900 shadow-lg"
                                            : "border-white/15 bg-white/5 text-white hover:border-white/35 hover:bg-white/10"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <span className="text-sm font-semibold">{role.label}</span>
                                          {selectedRole === role.value && <FaCheckCircle className="h-4 w-4" />}
                                        </div>
                                        <p className={`mt-2 text-xs leading-relaxed ${selectedRole === role.value ? "text-slate-700" : "text-white/65"}`}>
                                          {role.description}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <Button type="submit" className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 text-slate-950 shadow-[0_14px_40px_rgba(103,232,249,0.26)] hover:from-cyan-200 hover:via-sky-200 hover:to-emerald-200" disabled={!username || isLoading}>
                                {isLoading ? GENERATION_STEPS[generationStep] : "Generate Portfolio"}
                                {!isLoading && <FaArrowRight className="h-4 w-4" />}
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 text-white hover:bg-white/18"
                                onClick={() => {
                                  setUsername("t3dotgg")
                                  setIsRoleSpecific(true)
                                  setSelectedRole("fullstack")
                                }}
                              >
                                Try Example
                              </Button>
                            </div>

                            {isRoleSpecific && (
                              <div className="rounded-2xl border border-emerald-200/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
                                The portfolio will be subtly tuned for <span className="font-semibold">{selectedRoleLabel}</span>, but that role choice will not be shown on the final page.
                              </div>
                            )}

                            {isLoading && (
                              <div className="space-y-3 rounded-2xl border border-white/15 bg-black/10 px-4 py-4">
                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/65">
                                  <span>Generation flow</span>
                                  <span>{Math.round(generationProgress)}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 transition-all duration-500"
                                    style={{ width: `${generationProgress}%` }}
                                  />
                                </div>
                                <div className="grid gap-2 sm:grid-cols-3">
                                  {GENERATION_STEPS.map((step, index) => (
                                    <div
                                      key={step}
                                      className={`rounded-xl border px-3 py-2 text-xs ${
                                        index <= generationStep
                                          ? "border-emerald-200/25 bg-emerald-400/10 text-emerald-50"
                                          : "border-white/10 bg-white/5 text-white/55"
                                      }`}
                                    >
                                      {step}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </form>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4">
                      <Card className="rounded-[28px] border border-white/20 bg-white/12 shadow-xl backdrop-blur-2xl">
                        <CardContent className="p-6">
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Live Username Preview</p>
                              <h3 className="mt-2 text-2xl font-semibold text-white">It should feel like it already knows you</h3>
                            </div>
                            <div className="rounded-full border border-white/15 bg-black/10 px-3 py-1 text-xs text-white/70">
                              {previewUser ? "Profile found" : "Waiting for username"}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/12 bg-black/12 p-5">
                            <div className="flex items-start gap-4">
                              {previewUser ? (
                                <Image
                                  src={previewUser.avatar_url}
                                  alt={previewUser.username}
                                  width={72}
                                  height={72}
                                  className="rounded-2xl border border-white/30 animate-in slide-in-from-left-4 duration-300"
                                />
                              ) : (
                                <div className="h-[72px] w-[72px] rounded-2xl border border-white/10 bg-white/8" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <h3 className="truncate text-lg font-semibold text-white">
                                    {previewUser?.name || "Your GitHub identity appears here"}
                                  </h3>
                                  {previewUser?.name && (
                                    <span className="truncate text-sm text-white/65">
                                      @{previewUser.username}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-white/72">
                                  {previewUser
                                    ? `${previewUser.followers.toLocaleString()} followers${previewUser.location ? ` • ${previewUser.location}` : ""}`
                                    : "Type a public GitHub username to pull avatar, profile signals, and top repositories instantly."}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {(previewRepos.length > 0
                                    ? previewRepos.slice(0, 2)
                                    : [
                                        { name: "top-repo-one", stars: 0, language: "Repository" },
                                        { name: "top-repo-two", stars: 0, language: "Repository" },
                                      ]).map((repo) => (
                                    <div
                                      key={repo.name}
                                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                                        previewRepos.length > 0
                                          ? "border-cyan-200/20 bg-cyan-200/10 text-white"
                                          : "border-white/10 bg-white/8 text-white/45"
                                      }`}
                                    >
                                      <FaGithub className="h-3 w-3" />
                                      <span>{repo.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {previewUser && previewRepos.length > 0 && (
                              <div className="mt-5 grid gap-2">
                                {previewRepos.slice(0, 4).map((repo) => (
                                  <div key={repo.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-white">{repo.name}</p>
                                      <p className="text-xs text-white/55">{repo.language || "Repository"}</p>
                                    </div>
                                    <div className="ml-3 flex items-center gap-1 text-xs text-white/70">
                                      <FaStar className="h-3 w-3 text-amber-300" />
                                      <span>{repo.stars}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-[28px] border border-white/20 bg-white/12 shadow-xl backdrop-blur-2xl">
                        <CardContent className="space-y-4 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Before / After</p>
                              <h3 className="mt-2 text-xl font-semibold text-white">See the transformation</h3>
                            </div>
                            <FaCodeBranch className="h-4 w-4 text-white/55" />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Raw GitHub</p>
                              <div className="mt-3 rounded-xl border border-white/8 bg-[#161b22] p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-slate-500/50" />
                                  <div>
                                    <div className="h-2 w-24 rounded-full bg-white/35" />
                                    <div className="mt-2 h-2 w-16 rounded-full bg-white/18" />
                                  </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                  <div className="h-2 rounded-full bg-white/12" />
                                  <div className="h-2 w-5/6 rounded-full bg-white/12" />
                                </div>
                                <div className="mt-4 grid gap-2">
                                  <div className="rounded-lg border border-white/8 bg-[#0d1117] p-2">
                                    <div className="h-2 w-20 rounded-full bg-blue-300/35" />
                                    <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />
                                  </div>
                                  <div className="rounded-lg border border-white/8 bg-[#0d1117] p-2">
                                    <div className="h-2 w-24 rounded-full bg-blue-300/35" />
                                    <div className="mt-2 h-2 w-3/5 rounded-full bg-white/10" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-200/15 to-sky-100/10 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Generated Portfolio</p>
                              <div className="mt-3 rounded-xl border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(226,240,255,0.7))] p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500" />
                                  <div className="flex-1">
                                    <div className="h-2 w-28 rounded-full bg-slate-700/65" />
                                    <div className="mt-2 h-2 w-20 rounded-full bg-slate-500/40" />
                                  </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <div className="rounded-xl bg-slate-950/90 p-3">
                                    <div className="h-2 w-12 rounded-full bg-cyan-300/80" />
                                    <div className="mt-2 h-5 w-10 rounded-md bg-white/90" />
                                  </div>
                                  <div className="rounded-xl bg-white/70 p-3">
                                    <div className="h-2 w-12 rounded-full bg-slate-400/60" />
                                    <div className="mt-2 h-5 w-14 rounded-md bg-slate-700/20" />
                                  </div>
                                </div>
                                <div className="mt-3 rounded-xl border border-slate-300/40 bg-white/65 p-3">
                                  <div className="h-2 w-24 rounded-full bg-slate-700/60" />
                                  <div className="mt-2 h-2 w-5/6 rounded-full bg-slate-400/35" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {isFetchingPreview && username.trim() && (
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-xl">
                          Checking GitHub profile...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 text-sm text-white/80">
                    <span className="mr-2">Try example:</span>
                    <button
                      onClick={() => setUsername("t3dotgg")}
                      className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-medium text-white transition-colors hover:bg-white/20"
                    >
                      Theo Browne
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10 bg-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-white/72 md:flex-row md:px-[50px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">DevFolioGen</span>
            <span className="text-white/45">•</span>
            <span>Build once, share anywhere.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-colors hover:text-white">Start</Link>
            <a href={repositoryUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Source</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
