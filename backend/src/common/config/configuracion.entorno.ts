import { registerAs } from '@nestjs/config';

function obtenerBooleano(valor: string | undefined, valorDefecto: boolean) {
  if (valor === undefined) {
    return valorDefecto;
  }

  return valor === 'true';
}

function obtenerNumero(valor: string | undefined, valorDefecto: number) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : valorDefecto;
}

export default registerAs('entorno', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  puerto: obtenerNumero(process.env.PUERTO ?? process.env.PORT, 4001),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4000',
  frontendUrlProduccion: process.env.FRONTEND_URL_PRODUCCION ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    secretKey: process.env.SUPABASE_SECRET_KEY ?? '',
    bucketImagenesProductos:
      process.env.SUPABASE_STORAGE_BUCKET_IMAGENES_PRODUCTOS ?? '',
  },
  cookies: {
    accessToken: process.env.COOKIE_ACCESS_TOKEN ?? 'token_acceso',
    refreshToken: process.env.COOKIE_REFRESH_TOKEN ?? 'token_refresco',
    domain: process.env.COOKIE_DOMAIN ?? 'localhost',
    secure: obtenerBooleano(process.env.COOKIE_SECURE, false),
    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
  },
}));
