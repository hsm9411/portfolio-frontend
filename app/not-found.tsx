import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-7xl font-extrabold text-indigo-600 dark:text-indigo-400">404</p>
        <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          요청하신 페이지가 존재하지 않거나 삭제되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
