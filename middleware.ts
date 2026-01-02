import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Initialize Response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 2. Supabase Auth Refresh Logic
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh token if needed
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Protected Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'SALON_OWNER') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    if (request.nextUrl.pathname.startsWith('/profile')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}