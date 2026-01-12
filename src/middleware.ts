
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Basic Auth for Staging (or any environment where ENABLE_BASIC_AUTH is set)
    if (process.env.ENABLE_BASIC_AUTH === 'true') {
        const authBasic = request.headers.get('authorization')

        if (authBasic) {
            const [scheme, credentials] = authBasic.split(' ')
            if (scheme === 'Basic' && credentials) {
                const [user, pwd] = atob(credentials).split(':')
                const desiredUser = process.env.BASIC_AUTH_USER || 'admin'
                const desiredPwd = process.env.BASIC_AUTH_PASSWORD || 'password'

                if (user === desiredUser && pwd === desiredPwd) {
                    return await updateSession(request)
                }
            }
        }

        return new NextResponse('Auth Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Staging Area"',
            },
        })
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
