'use client'

import { useState, useEffect } from 'react'
import { toggleLike, checkLike } from '@/lib/api/likes'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
  targetType: 'project' | 'post'
  targetId: string
  initialLikeCount: number
}

export default function LikeButton({ targetType, targetId, initialLikeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  // 인증 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      
      // 로그인 상태면 좋아요 여부 확인
      if (session) {
        checkLike(targetType, targetId)
          .then(response => setLiked(response.liked))
          .catch(() => {})
      }
    })
  }, [targetType, targetId, supabase.auth])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      alert('좋아요는 로그인 후 사용할 수 있습니다.')
      return
    }

    if (loading) return

    try {
      setLoading(true)
      const response = await toggleLike(targetType, targetId)
      setLiked(response.liked)
      setLikeCount(response.likeCount)
    } catch (error: any) {
      console.error('Toggle like failed:', error)
      alert(error.response?.data?.message || '좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span>{likeCount}</span>
    </button>
  )
}
