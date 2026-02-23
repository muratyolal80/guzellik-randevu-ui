import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

    // 2. Refresh session
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Subdomain / Multi-tenant Routing
    const url = request.nextUrl.clone();
    const host = request.headers.get('host') || '';

    // Define main domains (Update this with production domain)
    const mainDomains = ['localhost:3000', 'guzellikrandevu.com', 'www.guzellikrandevu.com'];
    const isMainDomain = mainDomains.includes(host);

    if (!isMainDomain && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
            return NextResponse.rewrite(new URL(`/salon-slug/${subdomain}${url.pathname}`, request.url));
        }
    }

    // 4. Role-Based Route Protection Logic
    const pathname = request.nextUrl.pathname;
    const protectedPrefixes = ['/admin', '/owner', '/staff', '/customer', '/profile', '/appointments', '/favorites', '/settings'];
    const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

    // Redirect logged-in users away from auth pages
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isProtectedRoute) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Fetch user role ONLY for protected routes
        let userRole = '';
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            userRole = profile?.role ? profile.role.toUpperCase() : 'CUSTOMER';
        } catch (err) {
            userRole = 'CUSTOMER';
        }

        // A. Admin Routes
        if (pathname.startsWith('/admin')) {
            if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_admin', request.url));
            }
        }

        // B. Owner Routes
        if (pathname.startsWith('/owner')) {
            if (userRole !== 'SALON_OWNER' && userRole !== 'MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_owner', request.url));
            }
        }

        // C. Staff Routes
        if (pathname.startsWith('/staff')) {
            if (userRole !== 'STAFF' && userRole !== 'SALON_OWNER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_staff', request.url));
            }
        }

        // D. Cross-panel redirection for customers trying to access customer dashboard
        const customerPaths = ['/customer', '/profile', '/appointments', '/favorites'];
        if (customerPaths.some(path => pathname.startsWith(path))) {
            if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (userRole === 'SALON_OWNER' || userRole === 'MANAGER') {
                return NextResponse.redirect(new URL('/owner/dashboard', request.url));
            }
            if (userRole === 'STAFF') {
                return NextResponse.redirect(new URL('/staff/dashboard', request.url));
            }
        }
    }


    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}