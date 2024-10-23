/*
 * For more info see
 * https://nextjs.org/docs/app/building-your-application/routing/internationalization
 * */
import { type NextRequest, NextResponse } from 'next/server'

import linguiConfig from '../lingui.config'

const { locales } = linguiConfig

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const defaultLocale = linguiConfig.sourceLocale

  // remove the default locale, to avoid duplicates
  const pathnameHasLocale = locales
    .filter(locale => locale !== defaultLocale)
    .some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return

  // `/` is actually `/en/`, the default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(request.nextUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
