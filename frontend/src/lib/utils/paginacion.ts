import { MetadatosPaginacion } from '@/src/types/api.types';

export function crearPaginacionVacia(limite = 10): MetadatosPaginacion {
  return {
    pagina: 1,
    limite,
    total: 0,
    totalPaginas: 1,
    tieneAnterior: false,
    tieneSiguiente: false,
  };
}
