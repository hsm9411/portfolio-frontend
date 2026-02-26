'use client'

import { useEffect } from 'react'

/**
 * 저장되지 않은 변경사항이 있을 때 페이지 이탈을 막는 훅
 * - 브라우저 뒤로가기/탭 닫기: beforeunload 이벤트
 * - Next.js 라우터 이동: 직접 confirm 처리
 */
export function useUnsavedWarning(hasChanges: boolean) {
  useEffect(() => {
    if (!hasChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])
}
