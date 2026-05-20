'use client';

import { AlertTriangle } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { formatearCampoError } from '@/src/lib/utils/errores';
import { ErrorCampo } from '@/src/types/api.types';

interface ModalErroresFormularioProps {
  abierto: boolean;
  mensaje?: string | null;
  errores: ErrorCampo[];
  alCerrar: () => void;
}

export function ModalErroresFormulario({
  abierto,
  mensaje,
  errores,
  alCerrar,
}: ModalErroresFormularioProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="modal-fondo" role="presentation">
      <section
        className="modal-confirmacion modal-errores-formulario"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-confirmacion__icono">
          <AlertTriangle size={22} aria-hidden="true" />
        </div>
        <div className="modal-errores-formulario__contenido">
          <div>
            <h3>Corrige el formulario</h3>
            <p>{mensaje ?? 'Hay campos con informacion invalida'}</p>
          </div>
          {errores.length > 0 ? (
            <div className="modal-errores-formulario__resumen">
              <strong>Campos a revisar</strong>
              <ul className="modal-errores-formulario__lista">
                {errores.map((error) => (
                  <li key={`${error.campo}-${error.mensajes.join('-')}`}>
                    <span>{formatearCampoError(error.campo)}</span>
                    <p>{error.mensajes.join('. ')}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="modal-confirmacion__acciones">
          <Boton type="button" onClick={alCerrar}>
            Entendido
          </Boton>
        </div>
      </section>
    </div>
  );
}
