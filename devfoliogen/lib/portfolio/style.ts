import type { PortfolioStyle } from "@/types/portfolio"

export interface PortfolioStyleConfig {
  page: string
  canvas: string
  card: string
  softCard: string
  section: string
  sectionMuted: string
  heading: string
  eyebrow: string
  text: string
  mutedText: string
  statCard: string
  pill: string
  primaryButton: string
  secondaryButton: string
  outlineButton: string
  badge: string
}

export function getPortfolioStyleConfig(style: PortfolioStyle): PortfolioStyleConfig {
  if (style === "bold") {
    return {
      page: "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_36%),linear-gradient(180deg,#fff7ed_0%,#ffffff_34%,#f8fafc_100%)] text-slate-950",
      canvas: "border-slate-200/80 bg-white/78 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.38)] backdrop-blur-xl",
      card: "border-slate-200/75 bg-white/88 shadow-[0_24px_60px_-34px_rgba(14,165,233,0.30)]",
      softCard: "border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/70 to-amber-50/80",
      section: "rounded-[32px] border border-slate-200/70 bg-white/86 shadow-[0_22px_60px_-40px_rgba(14,165,233,0.35)]",
      sectionMuted: "rounded-[32px] border border-cyan-200/70 bg-gradient-to-br from-cyan-50/80 via-white to-orange-50/70 shadow-[0_20px_60px_-42px_rgba(249,115,22,0.28)]",
      heading: "text-slate-950",
      eyebrow: "text-cyan-700",
      text: "text-slate-800",
      mutedText: "text-slate-600",
      statCard: "border-slate-200/80 bg-white/92 shadow-[0_12px_32px_-24px_rgba(14,165,233,0.35)]",
      pill: "border-cyan-200/70 bg-white/92 text-slate-700",
      primaryButton: "border-0 bg-slate-950 text-white hover:bg-cyan-600",
      secondaryButton: "border-0 bg-cyan-100 text-cyan-950 hover:bg-cyan-200",
      outlineButton: "border-slate-300 bg-white/90 text-slate-800 hover:bg-slate-100",
      badge: "border-cyan-200/80 bg-cyan-50/90 text-cyan-950",
    }
  }

  if (style === "developer-dark") {
    return {
      page: "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#07111f_42%,#0f172a_100%)] text-slate-100",
      canvas: "border-slate-800/90 bg-slate-950/72 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.22)] backdrop-blur-xl",
      card: "border-slate-800/90 bg-slate-950/76 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.92)]",
      softCard: "border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40",
      section: "rounded-[32px] border border-slate-800/85 bg-slate-950/72 shadow-[0_24px_64px_-42px_rgba(16,185,129,0.22)]",
      sectionMuted: "rounded-[32px] border border-slate-800/85 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-cyan-950/35 shadow-[0_24px_70px_-46px_rgba(6,182,212,0.24)]",
      heading: "text-slate-50",
      eyebrow: "text-emerald-300",
      text: "text-slate-200",
      mutedText: "text-slate-400",
      statCard: "border-slate-800/90 bg-slate-900/90 shadow-[0_14px_36px_-28px_rgba(16,185,129,0.28)]",
      pill: "border-slate-700/90 bg-slate-900/90 text-slate-300",
      primaryButton: "border border-emerald-400/20 bg-emerald-400 text-slate-950 hover:bg-emerald-300",
      secondaryButton: "border border-cyan-400/20 bg-cyan-400/12 text-cyan-100 hover:bg-cyan-400/20",
      outlineButton: "border-slate-700 bg-slate-950/75 text-slate-100 hover:bg-slate-900",
      badge: "border-slate-700 bg-slate-900/95 text-emerald-200",
    }
  }

  return {
    page: "bg-background text-foreground",
    canvas: "border-border bg-background",
    card: "border-border bg-card",
    softCard: "border-border/80 bg-card/80",
    section: "rounded-[28px] bg-background",
    sectionMuted: "rounded-[28px] bg-muted/[0.22]",
    heading: "text-foreground",
    eyebrow: "text-muted-foreground",
    text: "text-foreground/90",
    mutedText: "text-muted-foreground",
    statCard: "border-border/70 bg-background/80",
    pill: "border-border/70 bg-background/80 text-foreground",
    primaryButton: "",
    secondaryButton: "",
    outlineButton: "",
    badge: "border-border/70 bg-secondary/70 text-foreground",
  }
}
