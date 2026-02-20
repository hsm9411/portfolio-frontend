/**
 * 기술 스택 이름 → devicons CDN 아이콘 URL 매핑
 * https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{name}/{name}-original.svg
 */

const DEVICON_MAP: Record<string, string> = {
  // 언어
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  kotlin: 'kotlin',
  swift: 'swift',
  go: 'go',
  rust: 'rust',
  cpp: 'cplusplus',
  'c++': 'cplusplus',
  c: 'c',
  php: 'php',
  ruby: 'ruby',
  dart: 'dart',

  // 프론트엔드
  react: 'react',
  nextjs: 'nextjs',
  'next.js': 'nextjs',
  vue: 'vuejs',
  vuejs: 'vuejs',
  angular: 'angularjs',
  svelte: 'svelte',
  html: 'html5',
  css: 'css3',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  sass: 'sass',

  // 백엔드
  nestjs: 'nestjs',
  'nest.js': 'nestjs',
  nodejs: 'nodejs',
  'node.js': 'nodejs',
  express: 'express',
  fastapi: 'fastapi',
  django: 'django',
  flask: 'flask',
  spring: 'spring',
  laravel: 'laravel',

  // 데이터베이스
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  redis: 'redis',
  sqlite: 'sqlite',
  supabase: 'supabase',
  firebase: 'firebase',

  // 인프라 / DevOps
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  nginx: 'nginx',
  linux: 'linux',
  ubuntu: 'ubuntu',
  aws: 'amazonwebservices',
  gcp: 'googlecloud',
  azure: 'azure',
  terraform: 'terraform',
  ansible: 'ansible',

  // 도구
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  figma: 'figma',
  graphql: 'graphql',
  jest: 'jest',
  webpack: 'webpack',
  vite: 'vitejs',
  babel: 'babel',
}

/**
 * 기술 스택 배열에서 매핑된 devicon URL 목록 반환 (최대 n개)
 */
export function getDeviconUrls(techStack: string[], max = 3): string[] {
  const urls: string[] = []
  for (const tech of techStack) {
    if (urls.length >= max) break
    const key = tech.toLowerCase().trim()
    const iconName = DEVICON_MAP[key]
    if (iconName) {
      urls.push(
        `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName}/${iconName}-original.svg`
      )
    }
  }
  return urls
}

/**
 * 기술 스택 시드 기반 그라디언트 클래스 반환
 */
export function getTechGradient(techStack: string[]): string {
  const gradients = [
    'from-blue-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-green-600',
    'from-red-500 to-orange-600',
  ]
  const seed = techStack.join('').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[seed % gradients.length]
}
