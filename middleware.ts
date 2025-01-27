// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const blockedUrls = ['/blocked-url']; // URLs bloquées que tu définis

    if (blockedUrls.includes(req.nextUrl.pathname)) {
        // Renvoyer un statut 403 si la page est dans les URLs bloquées
        return new NextResponse('Navigation bloquée', { status: 403 });
    }

    return NextResponse.next(); // Permet la navigation si la page n'est pas bloquée
}
