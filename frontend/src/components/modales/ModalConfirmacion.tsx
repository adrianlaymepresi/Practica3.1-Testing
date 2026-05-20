'use client';

import { AlertTriangle } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  textoCancelar?: string;
  variante?: 'peligro' | 'secundario';
  cargando?: boolean;
  alCancelar: () => void;
  alConfirmar: () => void;
}

export function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  variante = 'peligro',
  cargando = false,
  alCancelar,
  alConfirmar,
}: ModalConfirmacionProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="modal-fondo" role="presentation">
      <section className="modal-confirmacion" role="dialog" aria-modal="true">
        <div className="modal-confirmacion__icono">
          <AlertTriangle size={22} aria-hidden="true" />
        </div>
        <div>
          <h3>{titulo}</h3>
          <p>{mensaje}</p>
        </div>
        <div className="modal-confirmacion__acciones">
          <Boton variante="fantasma" onClick={alCancelar} type="button">
            {textoCancelar}
          </Boton>
          <Boton
            variante={variante}
            cargando={cargando}
            onClick={alConfirmar}
            type="button"
          >
            {textoConfirmar}
          </Boton>
        </div>
      </section>
    </div>
  );
}
