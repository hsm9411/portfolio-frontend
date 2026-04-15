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
  const path = pathSegments.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

  try {
    // Authorization 헤더 추출
    const authHeader = request.headers.get('authorization')

    // 헤더 구성
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // 요청 본문
    let body: string | undefined = undefined
    if (method !== 'GET' && method !== 'DELETE') {
      body = await request.text()
    }

    // 백엔드 요청 (타임아웃 추가)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('=== PROXY ERROR ===')
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    console.error('=== ERROR END ===')

    return NextResponse.json(
      { 
        error: 'Proxy failed',
        message: error.message,
        name: error.name,
        url,
      },
      { status: 502 }
    )
  }
}
