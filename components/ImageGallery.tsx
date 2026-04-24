'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  thumbnailUrl?: string
  imageUrls?: string[]
  title: string
}

export default function ImageGallery({ thumbnailUrl, imageUrls = [], title }: ImageGalleryProps) {
  const allImages = useMemo(
    () => [...(thumbnailUrl ? [thumbnailUrl] : []), ...imageUrls],
    [thumbnailUrl, imageUrls]
  )

  const [selectedIdx, setSelectedIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const hasMultiple = allImages.length > 1

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goPrev = useCallback(() => {
    setLightboxIdx(i => {
      const next = (i - 1 + allImages.length) % allImages.length
      setSelectedIdx(next)
      return next
    })
  }, [allImages.length])

  const goNext = useCallback(() => {
    setLightboxIdx(i => {
      const next = (i + 1) % allImages.length
      setSelectedIdx(next)
      return next
    })
  }, [allImages.length])

  // 키보드 탐색
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, goPrev, goNext, closeLightbox])

  // 라이트박스 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  // 선택된 썸네일이 스트립 내에서 보이도록 스크롤
  useEffect(() => {
    if (!stripRef.current) return
    const thumb = stripRef.current.children[selectedIdx] as HTMLElement
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedIdx])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      delta > 0 ? goNext() : goPrev()
    }
    touchStartX.current = null
  }

  if (allImages.length === 0) return null

  return (
    <>
      {/* ── 갤러리 본체 ── */}
      <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-md dark:bg-zinc-900">

        {/* 대표 이미지 */}
        <button
          type="button"
          onClick={() => openLightbox(selectedIdx)}
          className="group relative block w-full cursor-zoom-in focus:outline-none"
          aria-label="이미지 크게 보기"
        >
          <div className="relative aspect-video w-full bg-gray-100 dark:bg-zinc-900">
            <Image
              src={allImages[selectedIdx]}
              alt={`${title} 이미지 ${selectedIdx + 1}`}
              fill
              sizes="(max-width: 1000px) 100vw, 1000px"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.015]"
              priority={selectedIdx === 0}
            />
            {/* 호버 줌 힌트 */}
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                크게 보기
              </div>
            </div>
            {/* 이미지 카운터 (단일 이미지 제외) */}
            {hasMultiple && (
              <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {selectedIdx + 1} / {allImages.length}
              </div>
            )}
          </div>
        </button>

        {/* 썸네일 스트립 */}
        {hasMultiple && (
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {allImages.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => { setSelectedIdx(idx); openLightbox(idx) }}
                className={`relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-lg transition-all duration-200 focus:outline-none ${
                  idx === selectedIdx
                    ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-900'
                    : 'opacity-50 hover:opacity-80'
                }`}
                aria-label={`이미지 ${idx + 1} 보기`}
              >
                <Image
                  src={url}
                  alt={`${title} 썸네일 ${idx + 1}`}
                  fill
                  sizes="108px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 라이트박스 모달 ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 뷰어"
        >
          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 이미지 카운터 */}
          {hasMultiple && (
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {lightboxIdx + 1} / {allImages.length}
            </div>
          )}

          {/* 이미지 */}
          <div
            className="relative mx-14 sm:mx-20"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIdx]}
              alt={`${title} 이미지 ${lightboxIdx + 1}`}
              width={1400}
              height={900}
              style={{ maxHeight: '85vh', width: '100%', height: 'auto', objectFit: 'contain' }}
              priority
              draggable={false}
            />
          </div>

          {/* 이전 버튼 */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); goPrev() }}
                className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none sm:left-4"
                aria-label="이전 이미지"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 다음 버튼 */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); goNext() }}
                className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none sm:right-4"
                aria-label="다음 이미지"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* 하단 썸네일 스트립 (라이트박스 내) */}
          {hasMultiple && (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onClick={e => e.stopPropagation()}
            >
              {allImages.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => { setLightboxIdx(idx); setSelectedIdx(idx) }}
                  className={`relative h-12 w-[72px] shrink-0 overflow-hidden rounded-md transition-all duration-150 focus:outline-none ${
                    idx === lightboxIdx
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-black/50 opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                  aria-label={`이미지 ${idx + 1}로 이동`}
                >
                  <Image
                    src={url}
                    alt={`썸네일 ${idx + 1}`}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
