interface SpinnerProps {
  size?: 'sm' | 'md'
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const cls = size === 'sm'
    ? 'h-8 w-8 border-[3px]'
    : 'h-10 w-10 border-4'
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className={`${cls} animate-spin rounded-full border-gray-200 border-t-blue-600`} />
    </div>
  )
}
