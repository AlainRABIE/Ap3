import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const blockedUrls = ['/blocked-url']; 

    if (blockedUrls.includes(req.nextUrl.pathname)) {
        return new NextResponse('Navigation bloquée', { status: 403 });
    }

    return NextResponse.next(); 
}
