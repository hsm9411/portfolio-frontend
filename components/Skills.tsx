import skills from '@/lib/data/skills'

export default function Skills() {
  return (
    <section className="border-b border-gray-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 md:py-20">
        <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-gray-900 dark:text-white md:mb-12 md:text-3xl">
          Skills & Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {skills.map(({ icon: Icon, title, items }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-indigo-500 sm:p-6"
            >
              <div className="mb-3 flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-zinc-700 sm:mb-4">
                <Icon className="text-lg text-indigo-600 dark:text-indigo-400 sm:text-xl" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">{title}</h3>
              </div>
              <ul className="space-y-1.5 sm:space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
