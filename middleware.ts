import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const dev = process.env.NODE_ENV === 'development'

export async function middleware(request: NextRequest) {
    if (dev) console.log('--- Proxy execution start ---', request.nextUrl.pathname, request.headers.get('host'));

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    // AuthSessionMissingError is the normal/expected result for anonymous visitors —
    // logging it as an error on every public request is just noise. Only surface real failures
    // (e.g. AuthRetryableFetchError when the auth server is unreachable).
    if (authError && authError.name !== 'AuthSessionMissingError') {
        console.error('Auth Error in Proxy:', authError);
    }

    // 3. Subdomain / Multi-tenant Routing
    const url = request.nextUrl.clone();
    const host = request.headers.get('host') || '';

    // Define main domains (Update this with production domain)
    const mainDomains = [
        'localhost:3000',
        '127.0.0.1:3000',
        '45.81.113.82:3000',
        '45.81.113.82',
        'kuaforara.com.tr',
        'www.kuaforara.com.tr',
        'kuaforara.com.tr:3000',
        'api.kuaforara.com.tr',
        // Staging ortamı (salonara.com.tr) — aynı kod tabanı, ayrı ortam.
        // Eklenmezse middleware "salonara"yı salon subdomain'i sanıp /salon-slug/salonara'ya yönlendirir.
        'salonara.com.tr',
        'www.salonara.com.tr',
        'api.salonara.com.tr'
    ];
    const isMainDomain = mainDomains.includes(host);

    // 3. Subdomain Routing Logic
    // ONLY rewrite if it's NOT a main domain AND NOT an internal path
    if (!isMainDomain && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next') && !url.pathname.includes('.')) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
            if (dev) console.log('Rewriting to subdomain:', subdomain);
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

        // Fetch user role ONLY for protected routes.
        // Prefer app_metadata (JWT-embedded, no DB hit) if set; fall back to DB query.
        let userRole = '';
        if (user.id && user.id !== "") {
            const cachedRole = (user.app_metadata?.role as string | undefined)?.toUpperCase();

            if (cachedRole) {
                userRole = cachedRole;
                // Deactivation flag is stored in app_metadata (set by admin actions)
                if (user.app_metadata?.is_active === false) {
                    await supabase.auth.signOut();
                    const loginUrl = new URL('/login', request.url);
                    loginUrl.searchParams.set('error', 'account_deactivated');
                    return NextResponse.redirect(loginUrl);
                }
            } else {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    userRole = profile?.role ? profile.role.toUpperCase() : 'CUSTOMER';
                } catch (err) {
                    if (dev) console.error('Middleware: Error fetching profile:', err);
                    userRole = 'CUSTOMER';
                }
            }
        } else {
            userRole = 'CUSTOMER';
        }

        // A. Admin Routes
        if (pathname.startsWith('/admin')) {
            if (userRole !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_admin', request.url));
            }
        }

        // B. Owner Routes
        if (pathname.startsWith('/owner')) {
            if (userRole !== 'SALON_OWNER' && userRole !== 'MANAGER' && userRole !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_owner', request.url));
            }
        }

        // C. Staff Routes
        if (pathname.startsWith('/staff')) {
            if (userRole !== 'STAFF' && userRole !== 'SALON_OWNER' && userRole !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/?error=unauthorized_staff', request.url));
            }
        }

        // D. Salon Owner Specific Status Checks
        if (userRole === 'SALON_OWNER' && !pathname.startsWith('/owner/onboarding') && user.id && user.id !== "") {
            let salon: any = null;
            let subscription: any = null;

            try {
                // Salon + subscription via join (avoids sequential DB calls).
                // NOT: .maybeSingle() KULLANMA — owner birden fazla şubeye sahip
                // olabilir (çok şubeli plan ya da pasif + taslak gibi). maybeSingle
                // 2+ satırda hata döndürür → salon=null → her /owner/* sayfası
                // yanlışlıkla onboarding'e sekerdi. Tüm (silinmemiş) salonları çekip
                // en anlamlı olanı seçiyoruz.
                const { data: salonRows } = await supabase
                    .from('salons')
                    .select('id, status, created_at, subscriptions(status)')
                    .eq('owner_id', user.id)
                    .not('status', 'eq', 'DELETED')
                    .order('created_at', { ascending: false });

                const salonList = salonRows || [];

                if (salonList.length === 0) {
                    return NextResponse.redirect(new URL('/owner/onboarding', request.url));
                }

                // Durum kontrolü için canlı (APPROVED) şubeyi tercih et; yoksa en yenisi.
                salon = salonList.find((s: any) => s.status === 'APPROVED') || salonList[0];

                const subs = (salon as any)?.subscriptions;
                subscription = Array.isArray(subs) ? subs[0] : subs;
            } catch (err) {
                if (dev) console.error('Middleware: Error fetching salon/subscription:', err);
            }

            if (salon && (salon.status === 'PENDING_APPROVAL' || (subscription && subscription.status === 'PENDING_APPROVAL'))) {
                // Show a generic "Waiting for Approval" notification/page if they attempt to access restricted owner areas
                // Show a generic "Waiting for Approval" notification/page if they attempt to access restricted owner areas
                // For now, redirecting to onboarding might show the PENDING UI we built, 
                // but a dedicated /owner/waiting-approval page is better.
                if (pathname !== '/owner/dashboard') { // Allow dashboard maybe? Or just a specific block
                    // url.pathname = '/owner/waiting-approval';
                    // return NextResponse.rewrite(url);
                }
            }
        }

        // E. Cross-panel redirection for customers trying to access customer dashboard
        const customerPaths = ['/customer', '/profile', '/appointments', '/favorites'];
        if (customerPaths.some(path => pathname.startsWith(path))) {
            if (userRole === 'SUPER_ADMIN') {
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
    // Skip middleware (and its auth/getUser network call) for Next internals and static assets.
    // Includes manifest.webmanifest, icons, robots.txt, sitemap*.xml — these must not trigger auth.
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt|xml|json|woff|woff2|ttf)$).*)'],
};
