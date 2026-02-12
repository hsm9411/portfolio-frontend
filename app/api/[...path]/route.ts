import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://158.180.75.205:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

    console.log(`[Proxy] ${method} ${url}`)

    // 요청 헤더 복사
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Host 헤더는 제외 (백엔드 도메인으로 자동 설정됨)
      if (key.toLowerCase() !== 'host') {
        headers[key] = value
      }
    })

    // Authorization 헤더 특별 처리 (로그)
    if (headers['authorization']) {
      console.log('[Proxy] Authorization 헤더:', headers['authorization'].substring(0, 30) + '...')
    } else {
      console.log('[Proxy] Authorization 헤더 없음')
    }

    // 요청 본문 읽기
    let body: any = undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
        if (body) {
          console.log('[Proxy] Body:', body.substring(0, 200))
        }
      } catch (err) {
        console.log('[Proxy] No body')
      }
    }

    // 백엔드로 요청
    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    })

    console.log(`[Proxy] Response: ${response.status}`)

    // 응답 본문 읽기
    const responseBody = await response.text()

    // 응답 헤더 복사
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value)
    })

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 }
    )
  }
}
