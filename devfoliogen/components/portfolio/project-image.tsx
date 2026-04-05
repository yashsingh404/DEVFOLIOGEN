'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { FaCodeBranch, FaStar } from 'react-icons/fa'

interface ProjectImageProps {
  src: string
  fallbackSrc: string
  alt: string
  title?: string
  language?: string | null
  stars?: number
  fill?: boolean
  className?: string
  sizes?: string
  unoptimized?: boolean
}

export function ProjectImage({ 
  src, 
  fallbackSrc, 
  alt, 
  title,
  language,
  stars = 0,
  fill = true, 
  className, 
  sizes, 
  unoptimized 
}: ProjectImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [fallbackFailed, setFallbackFailed] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(false)
      setHasError(false)
      setFallbackFailed(false)
    }, 100)
  }, [src])

  const handleError = () => {
    setHasError(true)
    setTimeout(() => {
      setIsLoaded(false)
    }, 100)
  }

  const handleLoad = () => {
    setTimeout(() => {
      setIsLoaded(true)
    }, 100)
  }

  if (fallbackFailed) {
    return (
      <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Live Preview Unavailable
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{title || alt}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              This project did not expose a screenshot, so the portfolio falls back to a designed repository card instead of a broken image.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
          {language && language.toLowerCase() !== 'unknown' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
              <span>{language}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <FaStar className="h-3.5 w-3.5 text-amber-300" />
            <span>{stars.toLocaleString()} stars</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <FaCodeBranch className="h-3.5 w-3.5 text-blue-300" />
            <span>Repository card</span>
          </div>
        </div>
      </div>
    )
  }

  const shouldShowMainImage = src !== fallbackSrc && !hasError

  return (
    <>
      <Image
        src={fallbackSrc}
        alt={alt}
        fill={fill}
        className={`${className || ''} object-cover object-center`}
        sizes={sizes}
        unoptimized={unoptimized}
        priority={false}
        onError={() => setFallbackFailed(true)}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      {shouldShowMainImage && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          className={`${className || ''} object-cover object-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes={sizes}
          unoptimized={unoptimized}
          onError={handleError}
          onLoad={handleLoad}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </>
  )
}
