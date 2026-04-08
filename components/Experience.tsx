const experiences = [
  {
    id: 1,
    period: '2025.09 ~ 2025.10',
    role: '일경험 인턴',
    org: '서울현대교육재단 (Zest CNS Co., Ltd.)',
    desc: 'Spring MVC(JSP) 기반 게시판 예제를 통해 백엔드 CRUD 흐름을 학습하고, REST API로 분리하여 React·Vue 프론트엔드와 연동하는 과정을 실습했습니다.',
  },
]

export default function Experience() {
  return (
    <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 md:py-20">
        <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-gray-900 dark:text-white md:mb-12 md:text-3xl">
          Experience
        </h2>
        <div className="mx-auto max-w-[800px] space-y-4 sm:space-y-5">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-lg border border-gray-200 border-l-[5px] border-l-gray-800 bg-transparent p-4 transition-colors duration-200 hover:border-gray-400 hover:border-l-blue-500 dark:border-gray-700 dark:border-l-gray-200 dark:hover:border-gray-500 dark:hover:border-l-blue-400 sm:p-6 md:p-8"
            >
              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-base font-extrabold text-gray-900 dark:text-white sm:text-xl">{exp.role}</span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 sm:text-sm">{exp.period}</span>
              </div>
              <strong className="mb-2 block text-sm font-semibold text-blue-600 dark:text-blue-400 sm:mb-3 sm:text-base">{exp.org}</strong>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-[1.05rem]">{exp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
