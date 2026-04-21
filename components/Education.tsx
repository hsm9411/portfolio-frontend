import educations from '@/lib/data/education'

export default function Education() {
  return (
    <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 md:py-20">
        <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-gray-900 dark:text-white md:mb-12 md:text-3xl">
          Education
        </h2>
        <div className="mx-auto max-w-[800px] space-y-4 sm:space-y-5">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="rounded-lg border border-gray-200 border-l-[5px] border-l-gray-800 bg-transparent p-4 transition-colors duration-200 hover:border-gray-400 hover:border-l-blue-500 dark:border-gray-700 dark:border-l-gray-200 dark:hover:border-gray-500 dark:hover:border-l-blue-400 sm:p-6 md:p-8"
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
                  className="mb-2 block text-sm font-semibold text-blue-600 underline-offset-2 hover:underline dark:text-blue-400 sm:mb-3 sm:text-base"
                >
                  {edu.org}
                </a>
              ) : (
                <strong className="mb-2 block text-sm font-semibold text-blue-600 dark:text-blue-400 sm:mb-3 sm:text-base">
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
