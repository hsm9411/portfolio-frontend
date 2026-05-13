import educations from '@/lib/data/education'

export default function Education() {
  return (
    <section className="border-b border-gray-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 md:py-20">
        <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-gray-900 dark:text-white md:mb-12 md:text-3xl">
          Education
        </h2>
        <div className="mx-auto max-w-[800px] space-y-4 sm:space-y-5">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="rounded-lg border border-zinc-200 bg-transparent p-4 transition-colors duration-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-500 sm:p-6 md:p-8"
            >
              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-base font-extrabold text-gray-900 dark:text-white sm:text-xl">{edu.course}</span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 sm:text-sm">{edu.period}</span>
              </div>
              {edu.url ? (
                <a
                  href={edu.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 block text-sm font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400 sm:mb-3 sm:text-base"
                >
                  {edu.org}
                </a>
              ) : (
                <strong className="mb-2 block text-sm font-semibold text-indigo-600 dark:text-indigo-400 sm:mb-3 sm:text-base">
                  {edu.org}
                </strong>
              )}
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-[1.05rem]">{edu.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
