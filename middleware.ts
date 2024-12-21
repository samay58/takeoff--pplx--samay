import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { AuthObject } from "@clerk/nextjs/dist/types/server"

const isProtectedRoute = createRouteMatcher(["/search(.*)"])

export default clerkMiddleware((auth: AuthObject, req: NextRequest) => {
  const { userId, redirectToSignIn } = auth()

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: "/login" })
  }

  if (userId && isProtectedRoute(req)) {
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/search/:path*",
    "/(api|trpc)(.*)",
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/"
  ]
}
