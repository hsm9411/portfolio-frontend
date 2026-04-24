interface EditorBarProps {
  title: string
  hasChanges: boolean
  submitting: boolean
  onCancel: () => void
  formId: string
  submitLabel?: string
  // 편집/미리보기 토글 (블로그 에디터에서만 사용)
  preview?: boolean
  onPreviewChange?: (v: boolean) => void
}

export default function EditorBar({
  title,
  hasChanges,
  submitting,
  onCancel,
  formId,
  submitLabel,
  preview,
  onPreviewChange,
}: EditorBarProps) {
  const hasPreviewToggle = preview !== undefined && onPreviewChange !== undefined

  return (
    <div className="sticky z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-zinc-900/90" style={{ top: 'var(--navbar-h, 72px)' }}>
      <div className="mx-auto flex max-w-[1000px] items-center justify-between px-5 py-3">

        {/* 왼쪽: 취소 + 구분선 + 제목 + 미저장 표시 */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            취소
          </button>
          <span className="h-4 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />
          <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
          {hasChanges && (
            <span className="shrink-0 text-xs text-amber-600 dark:text-amber-400">● 미저장</span>
          )}
        </div>

        {/* 오른쪽: 편집/미리보기 토글(선택) + 저장 버튼 */}
        <div className="flex shrink-0 items-center gap-2">
          {hasPreviewToggle && (
            <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => onPreviewChange(false)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  !preview
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                편집
              </button>
              <button
                type="button"
                onClick={() => onPreviewChange(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  preview
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                미리보기
              </button>
            </div>
          )}
          <button
            form={formId}
            type="submit"
            disabled={submitting || !hasChanges}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                저장 중...
              </>
            ) : (submitLabel ?? (hasChanges ? '저장하기' : '변경사항 없음'))}
          </button>
        </div>

      </div>
    </div>
  )
}
