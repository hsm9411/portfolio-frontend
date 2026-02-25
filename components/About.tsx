export default function About() {
  const skills = ['NestJS', 'Next.js', 'Docker', 'Oracle Cloud', 'Supabase', 'TypeScript']

  return (
    <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">

          {/* 프로필 이미지 */}
          <div className="shrink-0">
            <img
              src="/profile.png"
              alt="프로필 이미지"
              className="h-52 w-52 rounded-none border border-gray-200 object-cover shadow-[8px_8px_0px_rgba(0,0,0,0.08)] dark:border-gray-700"
            />
          </div>

          {/* 텍스트 */}
          <div className="text-center md:text-left">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              About Me
            </h2>
            <p className="mb-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
              최근에는{' '}
              <strong className="font-semibold text-blue-600 dark:text-blue-400">웹 개발</strong>과{' '}
              <strong className="font-semibold text-blue-600 dark:text-blue-400">시스템 개발</strong>에
              필요한 기능을 구현하기 위해 다양한{' '}
              <strong className="font-semibold text-blue-600 dark:text-blue-400">CS 개념</strong>과
              기술들에 관심을 가지고 학습하고 있습니다.
            </p>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
              효율적인{' '}
              <strong className="font-semibold text-blue-600 dark:text-blue-400">협업</strong>을 위해
              필요한 툴과 기술, 그리고{' '}
              <strong className="font-semibold text-blue-600 dark:text-blue-400">개발 프로세스 체계</strong>를
              경험하며 성장하고 있습니다.
            </p>

            {/* 기술 태그 */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
