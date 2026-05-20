'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetadatosPaginacion } from '@/src/types/api.types';

interface PaginacionProps {
  paginacion: MetadatosPaginacion;
  alCambiarPagina: (pagina: number) => void;
}

function crearPaginas(paginaActual: number, totalPaginas: number) {
  const paginas = new Set<number>([1, totalPaginas]);

  for (let pagina = paginaActual - 2; pagina <= paginaActual + 2; pagina++) {
    if (pagina >= 1 && pagina <= totalPaginas) {
      paginas.add(pagina);
    }
  }

  return Array.from(paginas).sort((a, b) => a - b);
}

export function Paginacion({
  paginacion,
  alCambiarPagina,
}: PaginacionProps) {
  const paginas = crearPaginas(paginacion.pagina, paginacion.totalPaginas);

  if (paginacion.totalPaginas <= 1) {
    return null;
  }

  return (
    <nav className="paginacion" aria-label="Paginacion">
      <button
        className="paginacion__boton paginacion__boton--texto"
        disabled={!paginacion.tieneAnterior}
        onClick={() => alCambiarPagina(paginacion.pagina - 1)}
        type="button"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span>Anterior</span>
      </button>

      <div className="paginacion__numeros">
        {paginas.map((pagina, indice) => {
          const paginaAnterior = paginas[indice - 1];
          const mostrarSeparador =
            paginaAnterior !== undefined && pagina - paginaAnterior > 1;

          return (
            <span className="paginacion__grupo" key={pagina}>
              {mostrarSeparador ? (
                <span className="paginacion__puntos">...</span>
              ) : null}
              <button
                className={`paginacion__boton ${
                  pagina === paginacion.pagina
                    ? 'paginacion__boton--activo'
                    : ''
                }`}
                onClick={() => alCambiarPagina(pagina)}
                type="button"
              >
                {pagina}
              </button>
            </span>
          );
        })}
      </div>

      <button
        className="paginacion__boton paginacion__boton--texto"
        disabled={!paginacion.tieneSiguiente}
        onClick={() => alCambiarPagina(paginacion.pagina + 1)}
        type="button"
      >
        <span>Siguiente</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
