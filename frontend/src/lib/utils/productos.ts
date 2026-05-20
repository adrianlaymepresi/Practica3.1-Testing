const FORMATEADOR_MONEDA = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const LIMITE_IMAGEN_PRODUCTO_BYTES = 1024 * 1024;

export function formatearPrecioProducto(valor: number) {
  return FORMATEADOR_MONEDA.format(valor);
}

export function formatearTamanoArchivo(bytes?: number | null) {
  if (!bytes || bytes <= 0) {
    return 'Sin archivo';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function normalizarTextoProducto(valor: string, maximo: number) {
  return valor
    .toLocaleUpperCase('es-BO')
    .replace(/\s+/g, ' ')
    .trimStart()
    .slice(0, maximo);
}

export function validarArchivoProducto(archivo: File) {
  if (!archivo.type.startsWith('image/')) {
    return 'Solo se permiten archivos de imagen compatibles';
  }

  if (archivo.size > LIMITE_IMAGEN_PRODUCTO_BYTES) {
    return 'La imagen supera el limite de 1 MB permitido';
  }

  return null;
}
