'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '@/hooks/useTheme'
import AuthButton from '@/components/AuthButton'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme, mounted } = useTheme()
  const [scrollRatio, setScrollRatio] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const THRESHOLD = 100
    const onScroll = () => {
      const ratio = Math.min(window.scrollY / THRESHOLD, 1)
      setScrollRatio(ratio)
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  const isActive = (href: string) => pathname.startsWith(href)

  const navHeight = Math.round(72 - scrollRatio * 16)
  const bgOpacity = scrollRatio * 0.9
  const blurPx = scrollRatio * 12
  const borderOpacity = scrollRatio * 0.08

  // mounted 전: 완전 투명 (SSR hydration 불일치 방지)
  // dark: gray-900 (#111827) — 페이지 섹션 배경과 동일한 계열
  // light: white (#ffffff)
  const isDark = mounted && theme === 'dark'
  const bgColor = !mounted
    ? 'transparent'
    : isDark
      ? `rgba(17,24,39,${bgOpacity.toFixed(3)})`   // gray-900
      : `rgba(255,255,255,${bgOpacity.toFixed(3)})`
  const borderColor = isDark
    ? `rgba(255,255,255,${borderOpacity.toFixed(3)})`
    : `rgba(0,0,0,${borderOpacity.toFixed(3)})`

  // AuthButton 스크롤 시 페이드아웃 (50px부터)
  return (
    <>
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 z-50 w-full"
        style={{
          height: `${navHeight}px`,
          background: bgColor,
          backdropFilter: `blur(${blurPx.toFixed(1)}px)`,
          WebkitBackdropFilter: `blur(${blurPx.toFixed(1)}px)`,
          borderBottom: `1px solid ${borderColor}`,
          transition: 'height 0.08s linear',
        }}
      >
        <div className="relative mx-auto flex h-full max-w-[1100px] items-center justify-between px-6">

          {/* Logo */}
          <Link
            href="/"
            className="text-[1.35rem] font-extrabold tracking-tight text-gray-900 transition-opacity hover:opacity-60 dark:text-white"
          >
            Portfolio
          </Link>

          {/* Desktop 우측 */}
          <div className="hidden md:flex items-center gap-6">

            {/* 네비 링크 */}
            <ul className="flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`text-[0.88rem] font-semibold tracking-wide transition-colors duration-150 ${
                      isActive(href)
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* 구분선 */}
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

            {/* 다크모드 토글 */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
                title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
                className="flex items-center justify-center rounded-full border border-gray-200 p-[7px] text-gray-400 transition-all duration-200 hover:rotate-[15deg] hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300"
              >
                {theme === 'light' ? <FaMoon size={13} /> : <FaSun size={13} />}
              </button>
            )}

            <AuthButton />
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
                className="flex items-center justify-center rounded-full border border-gray-200 p-[7px] text-gray-400 dark:border-gray-700 dark:text-gray-500"
              >
                {theme === 'light' ? <FaMoon size={13} /> : <FaSun size={13} />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="메뉴 열기"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Scroll To Top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="맨 위로"
        className={`fixed bottom-8 right-8 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all duration-300 hover:border-gray-300 hover:text-gray-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* ── Mobile Backdrop ── */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Slide Panel ── */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen(false)}>
            Portfolio
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
            aria-label="메뉴 닫기"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-[0.9rem] font-semibold transition-colors ${
                  isActive(href)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-100 px-6 py-5 dark:border-gray-800">
          <AuthButton />
        </div>
      </div>
    </>
  )
}
