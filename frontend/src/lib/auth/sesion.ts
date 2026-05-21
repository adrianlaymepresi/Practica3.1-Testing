import { headers } from 'next/headers';
import { RespuestaApi } from '@/src/types/api.types';
import { SesionActiva } from '@/src/types/auth.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api';

export async function obtenerSesionServidor() {
  const encabezados = await headers();
  const cookieHeader = encabezados.get('cookie');

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
