'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToastState(): ToastContextValue {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timerMap.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timerMap.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, message, type }])
      const timer = setTimeout(() => removeToast(id), 3000)
      timerMap.current.set(id, timer)
    },
    [removeToast],
  )

  return { toasts, showToast, removeToast }
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
