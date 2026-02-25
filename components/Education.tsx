const educations = [
  {
    id: 1,
    period: '2025.05 ~ 2025.08',
    course: 'Intel AI Master 임베디드 과정',
    org: '청년취업사관학교',
    desc: '리눅스 기반 임베디드 환경에서 카메라·통신(UART/SPI/I2C) 기초, OpenCV 영상처리, OpenVINO 기반 AI 추론·최적화, Geti/OTX를 활용한 MLOps 흐름, Docker·Git 협업, LLM·RAG 시스템 기초를 학습했습니다.',
  },
]

export default function Education() {
  return (
    <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto max-w-[1000px] px-5 py-20">
        <h2 className="mb-12 text-center text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Education
        </h2>
        <div className="mx-auto max-w-[800px] space-y-5">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="rounded-lg border border-gray-200 border-l-[5px] border-l-gray-800 bg-transparent p-8 transition-colors duration-200 hover:border-gray-400 hover:border-l-blue-500 dark:border-gray-700 dark:border-l-gray-200 dark:hover:border-gray-500 dark:hover:border-l-blue-400"
            >
              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{edu.course}</span>
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{edu.period}</span>
              </div>
              <strong className="mb-3 block text-base font-semibold text-blue-600 dark:text-blue-400">{edu.org}</strong>
              <p className="text-[1.05rem] leading-relaxed text-gray-500 dark:text-gray-400">{edu.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
