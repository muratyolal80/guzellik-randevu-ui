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

    // 3. Auth Page Redirection (Prevent logged-in users from seeing login/register)
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role ? profile.role.toUpperCase() : 'CUSTOMER';
            let targetUrl = '/customer/dashboard';

            if (role === 'SUPER_ADMIN' || role === 'ADMIN') targetUrl = '/admin';
            else if (role === 'SALON_OWNER' || role === 'OWNER') targetUrl = '/owner/dashboard';
            else if (role === 'STAFF') targetUrl = '/staff/dashboard';

            // Avoid redirect loop if already there (though less likely on login page)
            return NextResponse.redirect(new URL(targetUrl, request.url));
        } catch (e) {
            // Fallback
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 4. Role-Based Route Protection & Redirection

    // A. Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            console.log('[Middleware] Admin access denied: No user');
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        try {
            console.log('[Middleware] Checking Admin Access for:', user.email);
            const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()

            if (error) {
                console.error('[Middleware] Profile fetch error:', error);
            }

            const role = profile?.role ? profile.role.toUpperCase() : '';
            console.log('[Middleware] User Role:', role);

            if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
                console.warn('[Middleware] Admin access denied: Role mismatch. Found:', role);
                return NextResponse.redirect(new URL('/?error=unauthorized_admin', request.url))
            }
            console.log('[Middleware] Admin access granted.');
        } catch (e) {
            console.error('[Middleware] Unexpected error:', e);
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // B. Owner Routes
    if (request.nextUrl.pathname.startsWith('/owner')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        try {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            const role = profile?.role ? profile.role.toUpperCase() : '';

            if (role !== 'SALON_OWNER' && role !== 'OWNER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_owner', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // C. Staff Routes
    if (request.nextUrl.pathname.startsWith('/staff')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        try {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            const role = profile?.role ? profile.role.toUpperCase() : '';

            // Staff can be accessed by Staff, Owner and Admin
            if (role !== 'STAFF' && role !== 'SALON_OWNER' && role !== 'OWNER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_staff', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 5. Customer Dashboard Redirection based on Role (STRICT ENFORCEMENT)
    // If a non-customer role tries to access generic customer pages, redirect them to their specific dashboard.
    // This fixes the issue where Admin/Owner lands on customer pages.

    // Explicitly define customer-only paths
    const customerPaths = ['/customer', '/profile', '/appointments', '/favorites'];
    const isCustomerPath = customerPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (user && isCustomerPath) {
        try {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            const role = profile?.role ? profile.role.toUpperCase() : 'CUSTOMER';

            if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (role === 'SALON_OWNER' || role === 'OWNER') {
                // If they are on a generic /profile page, redirect to owner profile or dashboard
                return NextResponse.redirect(new URL('/owner/dashboard', request.url));
            }
            if (role === 'STAFF') {
                return NextResponse.redirect(new URL('/staff/dashboard', request.url));
            }
        } catch (e) {
            // Ignore error
        }
    }

    // 6. General Protected Routes (Catch-all for authentication)
    // List of protected customer routes not already covered
    const protectedRoutes = ['/notifications', '/support', '/settings'];
    // Note: /profile, /dashboard etc are handled above or in protectedRoutes list if we combine them
    // Combining them here for auth check:
    const allProtectedRoutes = [...customerPaths, ...protectedRoutes];
    const isProtectedRoute = allProtectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    if (isProtectedRoute) {
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