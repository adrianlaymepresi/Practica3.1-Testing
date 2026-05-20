import type { ReactNode } from 'react';

interface ContenedorPaginaProps {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  children: ReactNode;
}

export function ContenedorPagina({
  titulo,
  descripcion,
  acciones,
  children,
}: ContenedorPaginaProps) {
  return (
    <section className="contenedor-pagina">
      <div className="contenedor-pagina__cabecera">
        <div>
          <h2>{titulo}</h2>
          {descripcion ? <p>{descripcion}</p> : null}
        </div>
        {acciones ? (
          <div className="contenedor-pagina__acciones">{acciones}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
