import { FaLaptopCode, FaRobot, FaMicrochip, FaServer } from 'react-icons/fa'
import type { IconType } from 'react-icons'

export interface SkillCategory {
  icon: IconType
  title: string
  items: string[]
}

const skills: SkillCategory[] = [
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

export default skills
