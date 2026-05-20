'use client';

import { CODIGOS_TELEFONO_POR_PAIS } from '@/src/lib/constants/telefonos';
import { normalizarNumeroTelefonoLocal } from '@/src/lib/utils/formularios';

interface CampoTelefonoInternacionalProps {
  codigoPais: string;
  numeroLocal: string;
  alCambiarCodigoPais: (codigoPais: string) => void;
  alCambiarNumeroLocal: (numeroLocal: string) => void;
  requerido?: boolean;
}

export function CampoTelefonoInternacional({
  codigoPais,
  numeroLocal,
  alCambiarCodigoPais,
  alCambiarNumeroLocal,
  requerido = false,
}: CampoTelefonoInternacionalProps) {
  return (
    <div className="campo-telefono">
      <label className="campo">
        <span className="campo__etiqueta">
          Pais y codigo
          <small>{requerido ? 'Obligatorio' : 'Opcional'}</small>
        </span>
        <select
          className="campo__control"
          value={codigoPais}
          onChange={(evento) => alCambiarCodigoPais(evento.target.value)}
        >
          {CODIGOS_TELEFONO_POR_PAIS.map((opcion) => (
            <option
              key={`${opcion.codigo}-${opcion.pais}`}
              value={opcion.codigo}
            >
              {opcion.pais} ({opcion.codigo})
            </option>
          ))}
        </select>
        <span className="campo__ayuda">
          {requerido
            ? 'Obligatorio. Selecciona el codigo del pais.'
            : 'Opcional. Por defecto se usa Bolivia.'}
        </span>
      </label>
      <label className="campo">
        <span className="campo__etiqueta">
          Telefono
          <small>{requerido ? 'Obligatorio' : 'Opcional'}</small>
        </span>
        <input
          className="campo__control"
          type="text"
          inputMode="numeric"
          maxLength={15}
          placeholder="71234567"
          value={numeroLocal}
          onChange={(evento) =>
            alCambiarNumeroLocal(
              normalizarNumeroTelefonoLocal(evento.target.value),
            )
          }
        />
        <span className="campo__ayuda">
          Opcional. Solo numeros enteros; el codigo del pais se agrega por
          separado.
        </span>
      </label>
    </div>
  );
}
