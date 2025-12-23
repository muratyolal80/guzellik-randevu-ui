import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // 1. Protected Admin Routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Fetch user role from metadata (or DB if needed, but metadata is faster for middleware)
        // Note: For critical security, we should verify against DB, but metadata is good for first line of defense
        // In our handle_new_user trigger, we can sync role to metadata if we want, 
        // but here we will query the profile table for maximum security.

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url)); // Redirect unauthorized to home
        }
    }

    // 2. Protected Staff Routes
    if (req.nextUrl.pathname.startsWith('/booking') && req.nextUrl.pathname.includes('/staff')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        // Allow 'admin' to access staff routes too, or strictly 'staff'
        if (profile?.role !== 'staff' && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // 3. Protected User Routes (e.g. Profile, Bookings)
    if (req.nextUrl.pathname.startsWith('/profile') || req.nextUrl.pathname.startsWith('/bookings')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/booking/:path*',
        '/profile/:path*',
        '/bookings/:path*',
    ],
};
