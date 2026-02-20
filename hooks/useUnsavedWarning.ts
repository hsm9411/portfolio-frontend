import { useEffect } from 'react'

/**
 * 저장되지 않은 변경사항이 있을 때 브라우저 이탈 경고
 * - 탭 닫기 / 새로고침 → beforeunload 이벤트 발생
 * - Next.js 라우터 이탈은 handleCancel에서 confirm()으로 별도 처리 필요
 */
export function useUnsavedWarning(hasChanges: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasChanges])
}
