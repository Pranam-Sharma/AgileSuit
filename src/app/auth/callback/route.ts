import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const plan = requestUrl.searchParams.get('plan')

    // Determine the correct origin (handling proxy/container environments)
    // 1. Check for 'x-forwarded-host' (common in load balancers)
    // 2. Check for 'host' header
    // 3. Fallback to request.url origin (though this might be internal 0.0.0.0)
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'

    // Construct the public origin. If host is missing, fallback to requestUrl.origin
    const origin = host ? `${protocol}://${host}` : requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            if (plan) {
                return NextResponse.redirect(`${origin}/checkout?plan=${plan}`)
            }
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('[AuthCallback] Exchange Error:', error);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
