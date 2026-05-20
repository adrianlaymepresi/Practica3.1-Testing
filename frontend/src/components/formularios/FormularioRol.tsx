'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import {
  ActualizarRolPayload,
  CrearRolPayload,
  Rol,
} from '@/src/types/roles.types';

interface FormularioRolProps {
  alCrear: (datos: CrearRolPayload) => Promise<void>;
  rolEdicion?: Rol | null;
  alActualizar?: (
    idRol: string,
    datos: ActualizarRolPayload,
  ) => Promise<void>;
  alCancelarEdicion?: () => void;
}

const formularioInicial = {
  nombre_rol: '',
  descripcion_rol: '',
};

export function FormularioRol({
  alCrear,
  rolEdicion,
  alActualizar,
  alCancelarEdicion,
}: FormularioRolProps) {
  const [formulario, setFormulario] = useState(
    rolEdicion
      ? {
          nombre_rol: rolEdicion.nombre_rol,
          descripcion_rol: rolEdicion.descripcion_rol ?? '',
        }
      : formularioInicial,
  );
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(rolEdicion);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      if (rolEdicion && alActualizar) {
        await alActualizar(rolEdicion.id_rol, {
          nombre_rol: formulario.nombre_rol,
          descripcion_rol: formulario.descripcion_rol || undefined,
        });
        alCancelarEdicion?.();
      } else {
        await alCrear({
          nombre_rol: formulario.nombre_rol,
          descripcion_rol: formulario.descripcion_rol || undefined,
          es_activo_rol: true,
        });
        setFormulario(formularioInicial);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio}>
      <div className="formulario-grid formulario-grid--una-columna">
        <InputTexto
          etiqueta="Nombre del rol"
          ayuda="Obligatorio. Minimo 3 y maximo 50 caracteres."
          name="nombre_rol"
          value={formulario.nombre_rol}
          minLength={3}
          maxLength={50}
          required
          placeholder="ADMINISTRADOR"
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              nombre_rol: evento.target.value.toUpperCase(),
            }))
          }
        />
        <InputTexto
          etiqueta="Descripcion"
          ayuda="Opcional. Maximo 200 caracteres."
          name="descripcion_rol"
          value={formulario.descripcion_rol}
          maxLength={200}
          placeholder="Gestion total del sistema"
          multilinea
          rows={4}
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              descripcion_rol: evento.target.value,
            }))
          }
        />
      </div>
      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
        >
          {estaEditando ? 'Guardar rol' : 'Crear rol'}
        </Boton>
        {estaEditando ? (
          <Boton
            variante="fantasma"
            type="button"
            icono={<X size={18} />}
            onClick={alCancelarEdicion}
          >
            Cancelar
          </Boton>
        ) : null}
      </div>
    </form>
  );
}
