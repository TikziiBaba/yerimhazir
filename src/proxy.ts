import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './lib/supabase/types';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Auth oturumunu yenile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isBusinessOwner = user?.user_metadata?.role === 'business_owner';
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Admin erişim kontrolü - admin yetkisi yoksa işyeri girişine yönlendir
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isDevDemo = process.env.NODE_ENV === 'development' && request.nextUrl.searchParams.get('demo') === '1';
    if (!isAdmin && !isDevDemo) {
      const url = request.nextUrl.clone();
      url.pathname = '/isyeri-giris';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      url.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(url);
    }
  }

  // Dashboard erişim kontrolü - giriş yapılmamışsa işyeri login'e yönlendir
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/isyeri-giris';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Giriş yapmış kullanıcı login/register sayfalarına erişmeye çalışırsa uygun panele yönlendir
  if (
    user &&
    (request.nextUrl.pathname === '/giris' ||
      request.nextUrl.pathname === '/kayit' ||
      request.nextUrl.pathname === '/isyeri-giris')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = isBusinessOwner ? '/dashboard' : '/hesabim';
    return NextResponse.redirect(url);
  }


  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/webhooks (webhook endpoints don't need auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
