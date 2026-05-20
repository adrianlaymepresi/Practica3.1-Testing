import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';

interface PanelEnConstruccionProps {
  titulo: string;
  descripcion: string;
}

export function PanelEnConstruccion({
  titulo,
  descripcion,
}: PanelEnConstruccionProps) {
  return (
    <ContenedorPagina titulo={titulo} descripcion={descripcion}>
      <section className="panel-en-construccion">
        <div className="panel-en-construccion__icono">
          <Hammer size={24} aria-hidden="true" />
        </div>
        <div>
          <h3>Modulo preparado para la siguiente fase</h3>
          <p>
            La estructura de navegacion ya esta lista. El siguiente paso sera
            construir este dominio con el mismo patron profesional de WEBADMIN.
          </p>
        </div>
        <Link className="panel-en-construccion__enlace" href="/dashboard">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Volver al dashboard</span>
        </Link>
      </section>
    </ContenedorPagina>
  );
}
