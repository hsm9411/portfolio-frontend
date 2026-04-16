'use client'

import { useEffect, useState } from 'react'
import { ToastContext, useToastState, type Toast } from '@/hooks/useToast'

// 개별 토스트 아이템
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // mount 후 한 프레임 뒤에 fade-in
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const iconMap = {
    success: (
      <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  }

  const barColorMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
  }

  return (
    <div
      className={`relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {/* 왼쪽 컬러 바 */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${barColorMap[toast.type]}`} />
      <div className="ml-1 mt-0.5">{iconMap[toast.type]}</div>
      <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{toast.message}</p>
      <button
        onClick={onRemove}
        className="mt-0.5 shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="닫기"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Provider: layout.tsx에서 감싸기
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const value = useToastState()
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={value.toasts} onRemove={value.removeToast} />
    </ToastContext.Provider>
  )
}

// 고정 컨테이너
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ReturnType<typeof useToastState>['toasts']
  onRemove: (id: string) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col items-end gap-2 sm:right-6">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  )
}
