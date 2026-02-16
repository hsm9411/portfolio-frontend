'use client'

import { useState } from 'react'

interface TechStackInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

const COMMON_TECH_STACKS = [
  // Frontend
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'JavaScript',
  'Tailwind CSS', 'Sass', 'Material-UI', 'Chakra UI',
  
  // Backend
  'NestJS', 'Express', 'FastAPI', 'Django', 'Spring Boot', 'Laravel',
  'Node.js', 'Python', 'Java', 'Go', 'Rust',
  
  // Database
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  
  // DevOps
  'Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'AWS', 'GCP', 'Azure',
  
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  
  // Others
  'GraphQL', 'REST API', 'WebSocket', 'gRPC'
]

export default function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input)

    if (input.trim()) {
      const filtered = COMMON_TECH_STACKS.filter(
        tech => 
          tech.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(tech)
      )
      setSuggestions(filtered.slice(0, 5))
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

  return (
    <div>
      <div className="relative">
        {/* Selected Tags */}
        <div className="flex min-h-[42px] flex-wrap gap-2 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-700">
          {value.map((tech, index) => (
            <span
              key={index}
              className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
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
            placeholder={value.length === 0 ? "기술 스택 입력 또는 선택" : ""}
            className="flex-1 min-w-[120px] border-none bg-transparent px-2 py-1 text-sm focus:outline-none dark:text-white"
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
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Select */}
      <div className="mt-2">
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">자주 사용:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_TECH_STACKS.slice(0, 10)
            .filter(tech => !value.includes(tech))
            .map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTechStack(tech)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                + {tech}
              </button>
            ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Enter로 추가, Backspace로 제거
      </p>
    </div>
  )
}
