import { type NextRequest, NextResponse } from 'next/server'

// Middleware mínimo — proteção de rotas feita pelos layouts server-side
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
