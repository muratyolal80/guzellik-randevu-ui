(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    console.log('--- Proxy execution start ---');
    console.log('Path:', request.nextUrl.pathname);
    console.log('Host:', request.headers.get('host'));
    // 1. Initialize Response
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: request.headers
        }
    });
    // 2. Supabase Auth Refresh Logic
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "http://127.0.0.1:8000"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MzcyMTU3LCJleHAiOjE5MjUwNTIxNTd9.Frv7rg6d7kXV1-sEDew5aIkGDk6xE1vE0UvM1Bo6tvU"), {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value })=>request.cookies.set(name, value));
                response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                cookiesToSet.forEach(({ name, value, options })=>response.cookies.set(name, value, options));
            }
        }
    });
    // 2. Refresh session
    console.log('Refreshing session...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) console.error('Auth Error in Proxy:', authError);
    console.log('User detected:', user?.id || 'none');
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
        'api.kuaforara.com.tr'
    ];
    const isMainDomain = mainDomains.includes(host);
    // 3. Subdomain Routing Logic
    // ONLY rewrite if it's NOT a main domain AND NOT an internal path
    if (!isMainDomain && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next') && !url.pathname.includes('.')) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
            console.log('Rewriting to subdomain:', subdomain);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(new URL(`/salon-slug/${subdomain}${url.pathname}`, request.url));
        }
    }
    console.log('No rewrite needed. isMainDomain:', isMainDomain);
    // 4. Role-Based Route Protection Logic
    const pathname = request.nextUrl.pathname;
    const protectedPrefixes = [
        '/admin',
        '/owner',
        '/staff',
        '/customer',
        '/profile',
        '/appointments',
        '/favorites',
        '/settings'
    ];
    const isProtectedRoute = protectedPrefixes.some((prefix)=>pathname.startsWith(prefix));
    // Redirect logged-in users away from auth pages
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/', request.url));
    }
    if (isProtectedRoute) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        }
        // Fetch user role ONLY for protected routes
        let userRole = '';
        try {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            userRole = profile?.role ? profile.role.toUpperCase() : 'CUSTOMER';
        } catch (err) {
            userRole = 'CUSTOMER';
        }
        // A. Admin Routes
        if (pathname.startsWith('/admin')) {
            if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/?error=unauthorized_admin', request.url));
            }
        }
        // B. Owner Routes
        if (pathname.startsWith('/owner')) {
            if (userRole !== 'SALON_OWNER' && userRole !== 'MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/?error=unauthorized_owner', request.url));
            }
        }
        // C. Staff Routes
        if (pathname.startsWith('/staff')) {
            if (userRole !== 'STAFF' && userRole !== 'SALON_OWNER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/?error=unauthorized_staff', request.url));
            }
        }
        // D. Salon Owner Specific Status Checks
        if (userRole === 'SALON_OWNER' && !pathname.startsWith('/owner/onboarding')) {
            const { data: salon } = await supabase.from('salons').select('id, status').eq('owner_id', user.id).maybeSingle();
            if (!salon) {
                // If no salon found, force onboarding
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/owner/onboarding', request.url));
            }
            // check subscription status
            const { data: subscription } = await supabase.from('subscriptions').select('status').eq('salon_id', salon.id).maybeSingle();
            if (salon.status === 'PENDING_APPROVAL' || subscription && subscription.status === 'PENDING_APPROVAL') {
                // Show a generic "Waiting for Approval" notification/page if they attempt to access restricted owner areas
                // For now, redirecting to onboarding might show the PENDING UI we built, 
                // but a dedicated /owner/waiting-approval page is better.
                if (pathname !== '/owner/dashboard') {
                // url.pathname = '/owner/waiting-approval';
                // return NextResponse.rewrite(url);
                }
            }
        }
        // E. Cross-panel redirection for customers trying to access customer dashboard
        const customerPaths = [
            '/customer',
            '/profile',
            '/appointments',
            '/favorites'
        ];
        if (customerPaths.some((path)=>pathname.startsWith(path))) {
            if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/admin', request.url));
            }
            if (userRole === 'SALON_OWNER' || userRole === 'MANAGER') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/owner/dashboard', request.url));
            }
            if (userRole === 'STAFF') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/staff/dashboard', request.url));
            }
        }
    }
    console.log('--- Proxy execution end ---');
    return response;
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map