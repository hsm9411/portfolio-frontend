'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const MAX_IMAGES = 10
const MAX_SIZE_MB = 5

interface ImageGalleryUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export default function ImageGalleryUploader({ value, onChange }: ImageGalleryUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFiles = async (files: File[]) => {
    setError('')
    const remaining = MAX_IMAGES - value.length
    if (remaining <= 0) {
      setError(`최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`)
      return
    }
    const targets = files.slice(0, remaining)

    const invalid = targets.find((f) => !f.type.startsWith('image/'))
    if (invalid) { setError('이미지 파일만 업로드할 수 있습니다.'); return }
    const oversized = targets.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (oversized) { setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`); return }

    try {
      setUploading(true)
      const uploaded: string[] = []
      for (const file of targets) {
        const ext = file.name.split('.').pop()
        const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(fileName, file, { upsert: false })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('thumbnails').getPublicUrl(fileName)
        uploaded.push(data.publicUrl)
      }
      onChange([...value, ...uploaded])
      if (files.length > remaining) {
        setError(`${MAX_IMAGES}장 제한으로 ${remaining}장만 업로드됐습니다.`)
      }
    } catch {
      setError('업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) uploadFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) uploadFiles(files)
  }

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
    setError('')
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 이미지 그리드 */}
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, idx) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={url}
                alt={`갤러리 이미지 ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="absolute bottom-1 left-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">{idx + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {value.length < MAX_IMAGES && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 transition-colors ${
            dragOver
              ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
              : 'border-gray-200 bg-zinc-50 hover:border-gray-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
          }`}
        >
          {uploading ? (
            <>
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
              <p className="mt-2 text-sm text-gray-500">업로드 중...</p>
            </>
          ) : (
            <>
              <svg className={`h-8 w-8 ${dragOver ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {dragOver ? '여기에 드롭하세요' : '클릭하거나 드래그해서 추가'}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, WebP, GIF · 최대 {MAX_SIZE_MB}MB · {value.length}/{MAX_IMAGES}장
              </p>
            </>
          )}
        </div>
      )}

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
