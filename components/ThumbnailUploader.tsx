'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ThumbnailUploaderProps {
  value: string          // 현재 thumbnailUrl
  onChange: (url: string) => void
  className?: string
}

export default function ThumbnailUploader({ value, onChange, className = '' }: ThumbnailUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = async (file: File) => {
    setError('')

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    try {
      setUploading(true)

      // 고유한 파일명 생성 (충돌 방지)
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, { upsert: false })

      if (uploadError) throw uploadError

      // public URL 가져오기
      const { data } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName)

      onChange(data.publicUrl)
    } catch (err: unknown) {
      console.error('Upload failed:', err)
      setError('업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleRemove = () => {
    onChange('')
    setError('')
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        /* 미리보기 */
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={value}
              alt="썸네일 미리보기"
              className="h-full w-full object-cover"
            />
          </div>
          {/* 오버레이 액션 */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-md transition-colors hover:bg-gray-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              교체
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-red-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            </div>
          )}
        </div>
      ) : (
        /* 드래그 앤 드롭 업로드 영역 */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800'
          }`}
        >
          {uploading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              <p className="mt-3 text-sm text-gray-500">업로드 중...</p>
            </>
          ) : (
            <>
              <svg className={`h-10 w-10 ${dragOver ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                {dragOver ? '여기에 드롭하세요' : '클릭하거나 드래그해서 업로드'}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, WebP, GIF · 최대 5MB
              </p>
            </>
          )}
        </div>
      )}

      {/* URL 직접 입력 (선택) */}
      <div className="mt-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="또는 이미지 URL 직접 입력"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:focus:bg-gray-800"
        />
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
