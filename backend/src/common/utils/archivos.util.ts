import { ApiException } from '../exceptions/api.exception';
import { crearErrorCampo } from './validacion.util';

export interface ArchivoSubido {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export const LIMITE_IMAGEN_PRODUCTO_BYTES = 1024 * 1024;

const EXTENSIONES_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tif',
  'image/x-icon': 'ico',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export function validarArchivoImagen(
  archivo: ArchivoSubido | undefined,
  esObligatorio = false,
  limiteBytes = LIMITE_IMAGEN_PRODUCTO_BYTES,
) {
  if (!archivo) {
    if (!esObligatorio) {
      return;
    }

    throw ApiException.solicitudInvalida(
      'Debes seleccionar una imagen para continuar',
      crearErrorCampo('archivo', 'Debes seleccionar una imagen para continuar'),
    );
  }

  if (!archivo.mimetype.startsWith('image/')) {
    throw ApiException.solicitudInvalida(
      'El archivo seleccionado no es una imagen valida',
      crearErrorCampo(
        'archivo',
        'Solo se permiten archivos de imagen compatibles',
      ),
    );
  }

  if (archivo.size > limiteBytes) {
    const limiteMb = (limiteBytes / (1024 * 1024)).toFixed(0);

    throw ApiException.solicitudInvalida(
      `La imagen supera el limite de ${limiteMb} MB`,
      crearErrorCampo(
        'archivo',
        `La imagen supera el limite de ${limiteMb} MB permitido`,
      ),
    );
  }
}

export function obtenerExtensionArchivo(
  nombreOriginal: string,
  tipoMime: string,
) {
  const partes = nombreOriginal.split('.');
  const extensionOriginal = partes.length > 1 ? partes.pop() : '';
  const extensionNormalizada = extensionOriginal?.toLowerCase() ?? '';

  if (/^[a-z0-9]+$/.test(extensionNormalizada)) {
    return extensionNormalizada;
  }

  return EXTENSIONES_POR_MIME[tipoMime] ?? 'img';
}
