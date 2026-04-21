export interface ExperienceItem {
  id: number
  period: string
  role: string
  org: string
  desc: string
  /** 회사/기관 링크 (선택) */
  url?: string
}

const experiences: ExperienceItem[] = [
  {
    id: 1,
    period: '2025.09 ~ 2025.10',
    role: '일경험 인턴',
    org: '서울현대교육재단 (Zest CNS Co., Ltd.)',
    desc: 'Spring MVC(JSP) 기반 게시판 예제를 통해 백엔드 CRUD 흐름을 학습하고, REST API로 분리하여 React·Vue 프론트엔드와 연동하는 과정을 실습했습니다.',
  },
]

export default experiences
