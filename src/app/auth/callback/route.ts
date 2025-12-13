import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const plan = searchParams.get('plan') // Preserve plan param if present

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
