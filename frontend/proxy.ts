import { NextRequest, NextResponse } from 'next/server';
import {
  obtenerRutaInicioPorRol,
  puedeAccederRuta,
} from './src/lib/auth/permisos';
import { RespuestaApi } from './src/types/api.types';
import { SesionActiva } from './src/types/auth.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api';

async function obtenerSesionDesdeBackend(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  try {
    const respuesta = await fetch(`${API_URL}/auth/perfil`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      return null;
    }

    const contenido = (await respuesta.json()) as RespuestaApi<SesionActiva>;
    return contenido.exito ? contenido.datos : null;
  } catch {
    return null;
  }
}

function esRutaPublica(pathname: string) {
  return pathname === '/login' || pathname === '/no-autorizado';
}

function esRutaInterna(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (esRutaInterna(pathname)) {
    return NextResponse.next();
  }

  const sesion = await obtenerSesionDesdeBackend(request);

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(
        sesion ? obtenerRutaInicioPorRol(sesion.rol) : '/login',
        request.url,
      ),
    );
  }

  if (esRutaPublica(pathname)) {
    if (pathname === '/login' && sesion) {
      return NextResponse.redirect(
        new URL(obtenerRutaInicioPorRol(sesion.rol), request.url),
      );
    }

    return NextResponse.next();
  }

  if (!sesion) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!puedeAccederRuta(sesion.rol, pathname)) {
    const url = new URL('/no-autorizado', request.url);
    url.searchParams.set('desde', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
