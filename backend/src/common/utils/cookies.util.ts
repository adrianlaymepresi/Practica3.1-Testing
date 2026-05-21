import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

function normalizarSameSite(
  sameSite: string | undefined,
): CookieOptions['sameSite'] {
  if (sameSite === 'strict' || sameSite === 'lax' || sameSite === 'none') {
    return sameSite;
  }

  return 'lax';
}

function resolverDomain(domain: string | undefined) {
  if (!domain) {
    return undefined;
  }

  if (['localhost', '127.0.0.1'].includes(domain)) {
    return undefined;
  }

  return domain;
}

export function construirOpcionesCookieSesion(
  configService: ConfigService,
  duracionMs: number,
): CookieOptions {
  const secure = configService.get<boolean>('entorno.cookies.secure') ?? false;
  const sameSite = normalizarSameSite(
    configService.get<string>('entorno.cookies.sameSite'),
  );

  return {
    httpOnly: true,
    secure,
    sameSite,
    domain: resolverDomain(configService.get<string>('entorno.cookies.domain')),
    path: '/',
    maxAge: duracionMs,
  };
}

export function construirOpcionesLimpiarCookie(
  configService: ConfigService,
): CookieOptions {
  const secure = configService.get<boolean>('entorno.cookies.secure') ?? false;
  const sameSite = normalizarSameSite(
    configService.get<string>('entorno.cookies.sameSite'),
  );

  return {
    httpOnly: true,
    secure,
    sameSite,
    domain: resolverDomain(configService.get<string>('entorno.cookies.domain')),
    path: '/',
  };
}
