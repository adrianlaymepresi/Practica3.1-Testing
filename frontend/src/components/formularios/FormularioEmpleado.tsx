'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import { obtenerFechaActualZonaHoraria } from '@/src/lib/utils/fechas';
import {
  normalizarCi,
  normalizarCorreo,
  normalizarNombrePersona,
  normalizarTelefono,
  PATRON_CORREO_ELECTRONICO,
  PATRON_NOMBRE_PERSONA,
  PATRON_TELEFONO_INTERNACIONAL,
} from '@/src/lib/utils/formularios';
import {
  ActualizarEmpleadoPayload,
  CrearEmpleadoPayload,
  Empleado,
} from '@/src/types/empleados.types';

const FECHA_MINIMA_NACIMIENTO = '1900-01-01';

interface FormularioEmpleadoProps {
  empleadoEdicion?: Empleado | null;
  alCrear: (datos: CrearEmpleadoPayload) => Promise<void>;
  alActualizar: (
    idEmpleado: string,
    datos: ActualizarEmpleadoPayload,
  ) => Promise<void>;
  alCancelarEdicion: () => void;
}

function obtenerInicial(empleado?: Empleado | null) {
  return {
    ci_empleado: empleado?.ci_empleado ?? '',
    nombres_completo_empleado: empleado?.nombres_completo_empleado ?? '',
    apellidos_completo_empleado: empleado?.apellidos_completo_empleado ?? '',
    correo_electronico_empleado: empleado?.correo_electronico_empleado ?? '',
    fecha_nacimiento_empleado: empleado?.fecha_nacimiento_empleado ?? '',
    telefono_empleado: empleado?.telefono_empleado ?? '',
  };
}

export function FormularioEmpleado({
  empleadoEdicion,
  alCrear,
  alActualizar,
  alCancelarEdicion,
}: FormularioEmpleadoProps) {
  const [formulario, setFormulario] = useState(obtenerInicial(empleadoEdicion));
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(empleadoEdicion);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      const datos = {
        ci_empleado: formulario.ci_empleado,
        nombres_completo_empleado: formulario.nombres_completo_empleado,
        apellidos_completo_empleado: formulario.apellidos_completo_empleado,
        correo_electronico_empleado: formulario.correo_electronico_empleado,
        fecha_nacimiento_empleado:
          formulario.fecha_nacimiento_empleado || undefined,
        telefono_empleado: formulario.telefono_empleado || undefined,
      };

      if (empleadoEdicion) {
        await alActualizar(empleadoEdicion.id_empleado, datos);
        alCancelarEdicion();
      } else {
        await alCrear(datos);
        setFormulario(obtenerInicial());
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario formulario-grid" onSubmit={manejarEnvio}>
      <InputTexto
        etiqueta="CI empleado"
        ayuda="Obligatorio. Solo numeros enteros, entre 6 y 20 digitos."
        name="ci_empleado"
        value={formulario.ci_empleado}
        minLength={6}
        maxLength={20}
        inputMode="numeric"
        pattern="[0-9]{6,20}"
        placeholder="12345678"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            ci_empleado: normalizarCi(evento.target.value),
          }))
        }
      />
      <InputTexto
        etiqueta="Nombres"
        ayuda="Obligatorio. Solo letras y espacios. Se convierte a mayusculas."
        name="nombres_completo_empleado"
        value={formulario.nombres_completo_empleado}
        minLength={3}
        maxLength={120}
        pattern={PATRON_NOMBRE_PERSONA}
        placeholder="JUAN CARLOS"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            nombres_completo_empleado: normalizarNombrePersona(
              evento.target.value,
            ),
          }))
        }
      />
      <InputTexto
        etiqueta="Apellidos"
        ayuda="Obligatorio. Solo letras y espacios. Se convierte a mayusculas."
        name="apellidos_completo_empleado"
        value={formulario.apellidos_completo_empleado}
        minLength={3}
        maxLength={120}
        pattern={PATRON_NOMBRE_PERSONA}
        placeholder="PEREZ ROJAS"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            apellidos_completo_empleado: normalizarNombrePersona(
              evento.target.value,
            ),
          }))
        }
      />
      <InputTexto
        etiqueta="Correo electronico"
        ayuda="Obligatorio. Ejemplo: empleado@empresa.com"
        name="correo_electronico_empleado"
        type="email"
        value={formulario.correo_electronico_empleado}
        maxLength={120}
        pattern={PATRON_CORREO_ELECTRONICO}
        placeholder="empleado@empresa.com"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            correo_electronico_empleado: normalizarCorreo(evento.target.value),
          }))
        }
      />
      <InputTexto
        etiqueta="Fecha de nacimiento"
        ayuda="Opcional. Debe estar entre 1900 y la fecha actual."
        name="fecha_nacimiento_empleado"
        type="date"
        value={formulario.fecha_nacimiento_empleado}
        min={FECHA_MINIMA_NACIMIENTO}
        max={obtenerFechaActualZonaHoraria()}
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            fecha_nacimiento_empleado: evento.target.value,
          }))
        }
      />
      <InputTexto
        etiqueta="Telefono"
        ayuda="Opcional. Puede iniciar con + y solo admite numeros."
        name="telefono_empleado"
        value={formulario.telefono_empleado}
        maxLength={20}
        pattern={PATRON_TELEFONO_INTERNACIONAL}
        placeholder="+59170123456"
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            telefono_empleado: normalizarTelefono(evento.target.value),
          }))
        }
      />
      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
        >
          {estaEditando ? 'Guardar empleado' : 'Crear empleado'}
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
