'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from '@/components/AuthButton'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog',     label: 'Blog' },
]

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-gray-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-gray-900 transition-opacity hover:opacity-70 dark:text-white"
        >
          hsm9411
        </Link>

        {/* Center Nav */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 px-1.5 py-1 dark:border-white/10 dark:bg-white/5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive(href)
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Auth */}
        <AuthButton />

      </div>
    </nav>
  )
}
