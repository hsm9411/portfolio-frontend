import { FaLaptopCode, FaRobot, FaMicrochip, FaServer } from 'react-icons/fa'

const skillCategories = [
  {
    icon: FaLaptopCode,
    title: 'Languages & Core',
    items: [
      'Java, Python, C, C++, JavaScript / TypeScript',
      'Linux 개발 환경, Syscall 및 인터럽트 이해',
    ],
  },
  {
    icon: FaRobot,
    title: 'AI & Data',
    items: [
      'Python (PyTorch, TensorFlow) 모델 학습 및 추론',
      'OpenCV 영상 전처리 & OpenVINO 최적화',
      'PyTorch → ONNX → HEF 변환 (Edge AI 가속기 적용)',
      'MLOps 기반 모델 CI/CD 파이프라인 구축',
    ],
  },
  {
    icon: FaMicrochip,
    title: 'Embedded & Hardware',
    items: [
      'RFID ↔ Raspberry Pi 5 간 SPI 통신',
      '드라이버 API 활용 카메라 동작/출력 설정',
    ],
  },
  {
    icon: FaServer,
    title: 'Web & DevOps',
    items: [
      'NestJS, Next.js, Spring, React 활용',
      'REST API 설계 및 JSON 기반 HTTP 통신',
      'Docker (Dockerfile, Compose) 컨테이너 배포',
      'GitHub Actions CI/CD & Branch Protection',
    ],
  },
]

export default function Skills() {
  return (
    <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto max-w-[1000px] px-5 py-20">
        <h2 className="mb-12 text-center text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Skills & Capabilities
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {skillCategories.map(({ icon: Icon, title, items }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-blue-500"
            >
              {/* 카드 헤더 */}
              <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-gray-700">
                <Icon className="text-xl text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
              </div>
              {/* 아이템 리스트 */}
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
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
