import { ApiError, RespuestaApi } from '@/src/types/api.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api';

type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface OpcionesSolicitud<TCuerpo> {
  metodo?: MetodoHttp;
  cuerpo?: TCuerpo;
  parametros?: Record<string, string | number | boolean | undefined>;
}

async function obtenerRespuesta<TDatos>(respuesta: Response) {
  const texto = await respuesta.text();

  if (!texto) {
    return null as RespuestaApi<TDatos> | null;
  }

  return JSON.parse(texto) as RespuestaApi<TDatos>;
}

export async function solicitarApi<TDatos, TCuerpo = unknown>(
  ruta: string,
  opciones: OpcionesSolicitud<TCuerpo> = {},
) {
  const url = new URL(`${API_URL}${ruta}`);
  const esFormulario =
    typeof FormData !== 'undefined' && opciones.cuerpo instanceof FormData;

  Object.entries(opciones.parametros ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined) {
      url.searchParams.set(clave, String(valor));
    }
  });

  const respuesta = await fetch(url.toString(), {
    method: opciones.metodo ?? 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: esFormulario
      ? undefined
      : {
          'Content-Type': 'application/json',
        },
    body:
      opciones.cuerpo !== undefined
        ? esFormulario
          ? (opciones.cuerpo as BodyInit)
          : JSON.stringify(opciones.cuerpo)
        : undefined,
  });

  const contenido = await obtenerRespuesta<TDatos>(respuesta);

  if (!respuesta.ok || !contenido?.exito) {
    throw new ApiError(
      contenido?.mensaje ?? 'No se pudo completar la solicitud',
      respuesta.status,
      contenido?.errores,
    );
  }

  return contenido.datos;
}
