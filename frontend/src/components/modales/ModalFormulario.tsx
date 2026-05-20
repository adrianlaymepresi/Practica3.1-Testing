'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalFormularioProps {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  alCerrar: () => void;
}

export function ModalFormulario({
  abierto,
  titulo,
  descripcion,
  children,
  alCerrar,
}: ModalFormularioProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="modal-fondo" role="presentation">
      <section className="modal-formulario" role="dialog" aria-modal="true">
        <header className="modal-formulario__cabecera">
          <div>
            <h3>{titulo}</h3>
            {descripcion ? <p>{descripcion}</p> : null}
          </div>
          <button
            className="modal-formulario__cerrar"
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
