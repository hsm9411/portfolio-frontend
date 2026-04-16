'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike, getLikeStatus } from '@/lib/api/likes'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

interface LikeButtonProps {
  targetType: 'project' | 'post'
  targetId: string
  initialLikeCount: number
}

export default function LikeButton({ targetType, targetId, initialLikeCount }: LikeButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setIsAuthenticated(!!session)
      if (session) {
        getLikeStatus(targetType, targetId)
          .then((r) => { setLiked(r.isLiked); setLikeCount(r.likeCount) })
          .catch(() => {})
      }
    }).catch(() => {})
  }, [targetType, targetId, supabase.auth])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      showToast('로그인 후 좋아요를 누를 수 있습니다.', 'warning')
      return
    }
    if (loading) return
    try {
      setLoading(true)
      // 낙관적 업데이트
      setLiked((prev) => !prev)
      setLikeCount((prev) => liked ? prev - 1 : prev + 1)
      const response = await toggleLike(targetType, targetId)
      setLiked(response.isLiked)
      setLikeCount(response.likeCount)
    } catch {
      // 실패 시 롤백
      setLiked((prev) => !prev)
      setLikeCount((prev) => liked ? prev + 1 : prev - 1)
      showToast('좋아요 처리에 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
          liked
            ? 'bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800 dark:hover:bg-red-900/30'
            : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600'
        } ${loading ? 'scale-95 opacity-70' : 'hover:scale-105 active:scale-95'}`}
        aria-label={liked ? '좋아요 취소' : '좋아요'}
      >
        <svg
          className={`h-4 w-4 transition-transform duration-150 ${liked ? 'scale-110' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>{likeCount.toLocaleString()}</span>
      </button>
      {!isAuthenticated && (
        <button
          onClick={() => router.push('/login')}
          className="text-xs text-gray-400 underline-offset-2 hover:text-blue-500 hover:underline dark:text-gray-500 dark:hover:text-blue-400"
        >
          로그인하고 좋아요 누르기
        </button>
      )}
    </div>
  )
}
