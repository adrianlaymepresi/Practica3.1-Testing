import { ApiError, ErrorCampo } from '@/src/types/api.types';

const ETIQUETAS_CAMPOS: Record<string, string> = {
  id_rol: 'Rol',
  nombre_rol: 'Nombre del rol',
  descripcion_rol: 'Descripcion del rol',
};

function esErrorCampo(valor: unknown): valor is ErrorCampo {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const posibleError = valor as Record<string, unknown>;

  return (
    typeof posibleError.campo === 'string' &&
    Array.isArray(posibleError.mensajes) &&
    posibleError.mensajes.every((mensaje) => typeof mensaje === 'string')
  );
}

export function obtenerMensajeError(
  error: unknown,
  mensajeDefecto: string,
) {
  return error instanceof Error ? error.message : mensajeDefecto;
}

export function obtenerErroresCampo(error: unknown) {
  if (!(error instanceof ApiError) || !Array.isArray(error.errores)) {
    return [];
  }

  return error.errores.filter(esErrorCampo);
}

function capitalizarTexto(valor: string) {
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}

export function formatearCampoError(campo: string) {
  const partes = campo.split('.');

  return partes
    .map((parte) => {
      const etiqueta = ETIQUETAS_CAMPOS[parte];

      if (etiqueta) {
        return etiqueta;
      }

      return capitalizarTexto(parte.replace(/_/g, ' '));
    })
    .join(' / ');
}
