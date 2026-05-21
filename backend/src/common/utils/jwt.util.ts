import { createHmac, timingSafeEqual } from 'crypto';

interface JwtHeader {
  alg: 'HS256';
  typ: 'JWT';
}

function codificarBase64Url(valor: string) {
  return Buffer.from(valor, 'utf8')
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '');
}

function decodificarBase64Url(valor: string) {
  const normalizado = valor
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(valor.length / 4) * 4, '=');

  return Buffer.from(normalizado, 'base64').toString('utf8');
}

function firmar(valor: string, secreto: string) {
  return createHmac('sha256', secreto)
    .update(valor)
    .digest('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '');
}

export function convertirDuracionAMilisegundos(duracion: string) {
  const valor = duracion.trim();
  const coincidencia = valor.match(/^(\d+)(ms|s|m|h|d)$/i);

  if (!coincidencia) {
    return 24 * 60 * 60 * 1000;
  }

  const cantidad = Number(coincidencia[1]);
  const unidad = coincidencia[2].toLowerCase();
  const factores: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return cantidad * (factores[unidad] ?? factores.d);
}

export function crearJwtHs256<TPayload extends { iat?: number; exp?: number }>(
  payload: Omit<TPayload, 'iat' | 'exp'>,
  secreto: string,
  duracion: string,
) {
  const ahoraSegundos = Math.floor(Date.now() / 1000);
  const exp =
    ahoraSegundos + Math.floor(convertirDuracionAMilisegundos(duracion) / 1000);
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
  const payloadCompleto = {
    ...payload,
    iat: ahoraSegundos,
    exp,
  };

  const encabezado = codificarBase64Url(JSON.stringify(header));
  const cuerpo = codificarBase64Url(JSON.stringify(payloadCompleto));
  const firma = firmar(`${encabezado}.${cuerpo}`, secreto);

  return `${encabezado}.${cuerpo}.${firma}`;
}

export function verificarJwtHs256<
  TPayload extends { iat?: number; exp?: number },
>(token: string, secreto: string) {
  const [encabezado, cuerpo, firma] = token.split('.');

  if (!encabezado || !cuerpo || !firma) {
    return null;
  }

  const firmaEsperada = firmar(`${encabezado}.${cuerpo}`, secreto);
  const firmaBuffer = Buffer.from(firma);
  const firmaEsperadaBuffer = Buffer.from(firmaEsperada);

  if (
    firmaBuffer.length !== firmaEsperadaBuffer.length ||
    !timingSafeEqual(firmaBuffer, firmaEsperadaBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodificarBase64Url(cuerpo)) as TPayload & {
      exp?: number;
    };

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
