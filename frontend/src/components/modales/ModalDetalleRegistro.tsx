'use client';

import { ModalFormulario } from '@/src/components/modales/ModalFormulario';

export interface ItemDetalleRegistro {
  etiqueta: string;
  valor: string;
}

export interface SeccionDetalleRegistro {
  titulo: string;
  items: ItemDetalleRegistro[];
}

interface ModalDetalleRegistroProps {
  abierto: boolean;
  titulo: string;
  secciones: SeccionDetalleRegistro[];
  alCerrar: () => void;
}

export function ModalDetalleRegistro({
  abierto,
  titulo,
  secciones,
  alCerrar,
}: ModalDetalleRegistroProps) {
  return (
    <ModalFormulario
      abierto={abierto}
      titulo={titulo}
      descripcion="Informacion completa del registro seleccionado."
      alCerrar={alCerrar}
    >
      <div className="detalle-registro">
        <div className="detalle-registro__contenido">
          {secciones.map((seccion) => (
            <section className="detalle-registro__seccion" key={seccion.titulo}>
              <h4>{seccion.titulo}</h4>
              <dl className="detalle-registro__lista">
                {seccion.items.map((item) => (
                  <div className="detalle-registro__fila" key={item.etiqueta}>
                    <dt>{item.etiqueta}</dt>
                    <dd>{item.valor}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </ModalFormulario>
  );
}
