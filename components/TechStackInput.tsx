'use client'

import { useState } from 'react'

interface TechStackInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

const COMMON_TECH_STACKS = [
  // Frontend Frameworks & Libraries
  'React', 'Next.js', 'Vue', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit', 'Solid.js',
  'Remix', 'Astro', 'Qwik', 'Preact',
  
  // Frontend Styling
  'Tailwind CSS', 'CSS Modules', 'Styled Components', 'Emotion', 'Sass', 'Less',
  'Material-UI', 'Ant Design', 'Chakra UI', 'Shadcn/ui', 'Radix UI', 'Mantine',
  
  // Frontend Languages & Tools
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'WebAssembly',
  
  // Backend Frameworks - Node.js
  'NestJS', 'Express', 'Fastify', 'Koa', 'Hapi', 'AdonisJS',
  
  // Backend Frameworks - Python
  'FastAPI', 'Django', 'Flask', 'Tornado', 'Pyramid',
  
  // Backend Frameworks - Java/Kotlin
  'Spring Boot', 'Spring', 'Micronaut', 'Quarkus', 'Ktor',
  
  // Backend Frameworks - Go
  'Gin', 'Echo', 'Fiber', 'Chi',
  
  // Backend Frameworks - Ruby
  'Ruby on Rails', 'Sinatra', 'Hanami',
  
  // Backend Frameworks - PHP
  'Laravel', 'Symfony', 'CodeIgniter', 'Slim',
  
  // Backend Frameworks - Others
  '.NET', 'ASP.NET Core', 'Phoenix', 'Actix Web',
  
  // Backend Languages
  'Node.js', 'Python', 'Java', 'Kotlin', 'Go', 'Rust', 'C#', 'Ruby', 'PHP', 'Elixir', 'Scala',
  
  // Databases - SQL
  'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'Oracle', 'SQL Server', 'CockroachDB',
  
  // Databases - NoSQL
  'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Couchbase', 'Neo4j',
  
  // Databases - NewSQL
  'Supabase', 'Firebase', 'PlanetScale', 'Neon',
  
  // Search & Analytics
  'Elasticsearch', 'Opensearch', 'Algolia', 'Meilisearch', 'Typesense',
  
  // Message Queues & Streaming
  'RabbitMQ', 'Kafka', 'Redis Streams', 'AWS SQS', 'NATS', 'Pulsar',
  
  // Cloud Providers
  'AWS', 'GCP', 'Azure', 'Oracle Cloud', 'DigitalOcean', 'Linode', 'Vercel', 'Netlify', 'Cloudflare',
  
  // DevOps & Containers
  'Docker', 'Kubernetes', 'Docker Compose', 'Helm', 'Istio', 'Podman',
  
  // CI/CD
  'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI', 'ArgoCD',
  
  // Monitoring & Observability
  'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Sentry', 'Elastic APM',
  
  // API & Communication
  'GraphQL', 'REST API', 'gRPC', 'WebSocket', 'tRPC', 'Apollo', 'Hasura',
  
  // Testing
  'Jest', 'Vitest', 'Playwright', 'Cypress', 'Testing Library', 'Mocha', 'Chai', 'JUnit', 'Pytest',
  
  // Mobile
  'React Native', 'Flutter', 'Swift', 'SwiftUI', 'Kotlin', 'Jetpack Compose', 'Ionic', 'Capacitor',
  
  // State Management
  'Redux', 'Zustand', 'Jotai', 'Recoil', 'MobX', 'Pinia', 'Vuex',
  
  // Build Tools
  'Vite', 'Webpack', 'Turbopack', 'esbuild', 'Rollup', 'Parcel', 'SWC',
  
  // Version Control
  'Git', 'GitHub', 'GitLab', 'Bitbucket',
  
  // Others
  'Nginx', 'Apache', 'Terraform', 'Ansible', 'Linux', 'Ubuntu', 'Debian'
]

export default function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showQuickSelect, setShowQuickSelect] = useState(true)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input)

    if (input.trim()) {
      const filtered = COMMON_TECH_STACKS.filter(
        tech => 
          tech.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(tech)
      )
      setSuggestions(filtered.slice(0, 8))
    } else {
      setSuggestions([])
    }
  }

  const addTechStack = (tech: string) => {
    if (tech.trim() && !value.includes(tech.trim())) {
      onChange([...value, tech.trim()])
      setInputValue('')
      setSuggestions([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) {
        addTechStack(suggestions[0])
      } else if (inputValue.trim()) {
        addTechStack(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTechStack = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const quickSelectItems = COMMON_TECH_STACKS
    .filter(tech => !value.includes(tech))
    .slice(0, 12)

  return (
    <div>
      <div className="relative">
        {/* Selected Tags */}
        <div className="flex min-h-[46px] flex-wrap gap-2 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-700">
          {value.map((tech, index) => (
            <span
              key={index}
              className="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTechStack(index)}
                className="ml-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          
          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowQuickSelect(false)}
            onBlur={() => setTimeout(() => setShowQuickSelect(true), 200)}
            placeholder={value.length === 0 ? "기술 스택 검색 또는 입력" : ""}
            className="flex-1 min-w-[180px] border-none bg-transparent px-2 py-1.5 text-sm focus:outline-none dark:text-white"
          />
        </div>

        {/* Autocomplete Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {suggestions.map((tech, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTechStack(tech)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Select */}
      {showQuickSelect && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">자주 사용하는 기술:</p>
          <div className="flex flex-wrap gap-2">
            {quickSelectItems.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTechStack(tech)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                + {tech}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Enter로 추가 • Backspace로 제거 • 직접 입력 가능
      </p>
    </div>
  )
}
