'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import api from '@/lib/api/client'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [session, setSession] = useState<unknown>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const checkSession = async () => {
    addLog('🔍 세션 확인 시작...')
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      addLog(`❌ 세션 확인 실패: ${error.message}`)
    } else if (session) {
      addLog('✅ 세션 존재')
      addLog(`📧 Email: ${session.user.email}`)
      addLog(`🔑 Token: ${session.access_token?.substring(0, 30)}...`)
      setSession(session)
    } else {
      addLog('⚠️ 세션 없음')
      setSession(null)
    }
  }

  const testAPICall = async () => {
    addLog('📤 API 테스트 요청 시작...')
    try {
      const response = await api.get('/projects?page=1&limit=5')
      addLog(`✅ API 요청 성공: ${response.status}`)
      addLog(`📦 데이터: ${JSON.stringify(response.data).substring(0, 100)}...`)
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      addLog(`❌ API 요청 실패: ${err.message}`)
    }
  }

  const testAuthAPICall = async () => {
    addLog('🔐 인증 API 테스트 요청 시작...')
    try {
      const testProject = {
        title: 'Debug Test Project',
        summary: 'Test',
        description: 'Test Description',
        tech_stack: ['Test'],
        tags: ['test'],
        status: 'in-progress'
      }
      
      const response = await api.post('/projects', testProject)
      addLog(`✅ 인증 API 요청 성공: ${response.status}`)
      addLog(`📦 생성된 프로젝트 ID: ${response.data.id}`)
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      addLog(`❌ 인증 API 요청 실패: ${err.message}`)
    }
  }

  const refreshSession = async () => {
    addLog('🔄 세션 갱신 시작...')
    const supabase = createClient()
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      addLog(`❌ 세션 갱신 실패: ${error.message}`)
    } else {
      addLog('✅ 세션 갱신 성공')
      setSession(data.session)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">🔍 디버그 페이지</h1>

        {/* 버튼 그룹 */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={checkSession}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            세션 확인
          </button>
          
          <button
            onClick={refreshSession}
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            세션 갱신
          </button>
          
          <button
            onClick={testAPICall}
            className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
          >
            Public API 테스트
          </button>
          
          <button
            onClick={testAuthAPICall}
            className="rounded-lg bg-orange-600 px-6 py-3 text-white hover:bg-orange-700"
          >
            인증 API 테스트
          </button>
          
          <button
            onClick={clearLogs}
            className="rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
          >
            로그 지우기
          </button>
        </div>

        {/* 세션 정보 */}
        {session && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">📋 세션 정보</h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="font-bold">User ID:</span> {session.user.id}
              </div>
              <div>
                <span className="font-bold">Email:</span> {session.user.email}
              </div>
              <div>
                <span className="font-bold">Provider:</span> {session.user.app_metadata?.provider}
              </div>
              <div>
                <span className="font-bold">Access Token:</span>{' '}
                <span className="break-all text-xs">{session.access_token?.substring(0, 100)}...</span>
              </div>
              <div>
                <span className="font-bold">Expires At:</span>{' '}
                {new Date(session.expires_at! * 1000).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* 로그 출력 */}
        <div className="rounded-lg bg-gray-900 p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-white">📝 로그</h2>
          <div className="space-y-1 font-mono text-sm text-green-400">
            {logs.length === 0 ? (
              <div className="text-gray-500">로그가 없습니다. 버튼을 클릭하여 테스트하세요.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-8 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6">
          <h3 className="mb-2 font-bold text-blue-900">💡 사용 방법</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
            <li>먼저 {'"'}세션 확인{'"'} 버튼으로 로그인 상태 확인</li>
            <li>{'"'}Public API 테스트{'"'}로 인증 없이 작동하는 API 테스트</li>
            <li>{'"'}인증 API 테스트{'"'}로 관리자 권한이 필요한 API 테스트</li>
            <li>401 에러 발생 시 {'"'}세션 갱신{'"'} 버튼 클릭</li>
            <li>브라우저 개발자 도구(F12) → Console 탭에서 상세 로그 확인</li>
          </ol>
        </div>

        {/* Chrome DevTools 안내 */}
        <div className="mt-4 rounded-lg border-l-4 border-purple-500 bg-purple-50 p-6">
          <h3 className="mb-2 font-bold text-purple-900">🔧 Chrome DevTools 확인</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-purple-800">
            <li>F12 키 또는 우클릭 → 검사</li>
            <li>Console 탭에서 상세 로그 확인</li>
            <li>Network 탭 → Filter: {'"'}api{'"'} 입력</li>
            <li>요청 클릭 → Headers 탭 → Request Headers에서 Authorization 확인</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
