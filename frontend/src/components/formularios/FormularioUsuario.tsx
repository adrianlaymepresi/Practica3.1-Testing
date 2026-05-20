'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputContrasenia } from '@/src/components/comunes/InputContrasenia';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import { normalizarContrasenia } from '@/src/lib/utils/formularios';
import {
  construirContraseniaUsuario,
  construirNombreUsuario,
} from '@/src/lib/utils/usuarios';
import { EmpleadoOpcion } from '@/src/types/empleados.types';
import { RolOpcion } from '@/src/types/roles.types';
import {
  ActualizarUsuarioPayload,
  CrearUsuarioPayload,
  Usuario,
} from '@/src/types/usuarios.types';

interface FormularioUsuarioProps {
  usuarioEdicion?: Usuario | null;
  empleados: EmpleadoOpcion[];
  roles: RolOpcion[];
  alCrear: (datos: CrearUsuarioPayload) => Promise<void>;
  alActualizar: (
    idUsuario: string,
    datos: ActualizarUsuarioPayload,
  ) => Promise<void>;
  alCancelarEdicion: () => void;
}

function obtenerInicial(usuario?: Usuario | null) {
  return {
    id_empleado: usuario?.id_empleado ?? '',
    id_rol: usuario?.id_rol ?? '',
    contrasenia_usuario: '',
  };
}

export function FormularioUsuario({
  usuarioEdicion,
  empleados,
  roles,
  alCrear,
  alActualizar,
  alCancelarEdicion,
}: FormularioUsuarioProps) {
  const [formulario, setFormulario] = useState(obtenerInicial(usuarioEdicion));
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(usuarioEdicion);

  const empleadoSeleccionado = useMemo(
    () =>
      empleados.find((empleado) => empleado.id_empleado === formulario.id_empleado) ??
      null,
    [empleados, formulario.id_empleado],
  );

  const rolSeleccionado = useMemo(
    () => roles.find((rol) => rol.id_rol === formulario.id_rol) ?? null,
    [formulario.id_rol, roles],
  );

  const nombreUsuarioGenerado = empleadoSeleccionado
    ? construirNombreUsuario(
        empleadoSeleccionado.nombres_completo_empleado,
        empleadoSeleccionado.apellidos_completo_empleado,
        empleadoSeleccionado.ci_empleado,
      )
    : '';

  const contraseniaGenerada =
    empleadoSeleccionado && rolSeleccionado
      ? construirContraseniaUsuario(
          empleadoSeleccionado.ci_empleado,
          rolSeleccionado.nombre_rol,
        )
      : '';

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      if (estaEditando && usuarioEdicion) {
        const datos: ActualizarUsuarioPayload = {
          ...(formulario.id_empleado !== usuarioEdicion.id_empleado && {
            id_empleado: formulario.id_empleado,
          }),
          ...(formulario.id_rol !== usuarioEdicion.id_rol && {
            id_rol: formulario.id_rol,
          }),
          ...(formulario.contrasenia_usuario && {
            contrasenia_usuario: formulario.contrasenia_usuario,
          }),
        };

        await alActualizar(usuarioEdicion.id_usuario, datos);
        alCancelarEdicion();
      } else {
        await alCrear({
          id_empleado: formulario.id_empleado,
          id_rol: formulario.id_rol,
        });
        setFormulario(obtenerInicial());
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario formulario-grid" onSubmit={manejarEnvio}>
      <label className="campo">
        <span className="campo__etiqueta">
          Empleado
          <small>Obligatorio</small>
        </span>
        <select
          className="campo__control"
          name="id_empleado"
          value={formulario.id_empleado}
          required
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              id_empleado: evento.target.value,
            }))
          }
        >
          <option value="">Selecciona un empleado</option>
          {empleados.map((empleado) => (
            <option key={empleado.id_empleado} value={empleado.id_empleado}>
              {empleado.ci_empleado} - {empleado.nombres_completo_empleado}{' '}
              {empleado.apellidos_completo_empleado}
            </option>
          ))}
        </select>
        <span className="campo__ayuda">
          Obligatorio. Solo se muestran empleados activos.
        </span>
      </label>
      <label className="campo">
        <span className="campo__etiqueta">
          Rol
          <small>Obligatorio</small>
        </span>
        <select
          className="campo__control"
          name="id_rol"
          value={formulario.id_rol}
          required
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              id_rol: evento.target.value,
            }))
          }
        >
          <option value="">Selecciona un rol</option>
          {roles.map((rol) => (
            <option key={rol.id_rol} value={rol.id_rol}>
              {rol.nombre_rol}
            </option>
          ))}
        </select>
        <span className="campo__ayuda">
          Obligatorio. Solo se muestran roles activos.
        </span>
      </label>
      <InputTexto
        etiqueta="Nombre de usuario"
        ayuda="Se genera automaticamente con primer nombre, primer apellido y CI."
        name="nombre_usuario"
        value={nombreUsuarioGenerado}
        maxLength={60}
        placeholder="JUANPEREZ12345678"
        readOnly
        required
      />
      {estaEditando ? (
        <InputContrasenia
          etiqueta="Nueva contrasenia"
          ayuda="Opcional. Si la llenas, se reemplazara y se guardara cifrada."
          name="contrasenia_usuario"
          value={formulario.contrasenia_usuario}
          minLength={8}
          maxLength={72}
          placeholder="NuevaContrasenia123"
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              contrasenia_usuario: normalizarContrasenia(evento.target.value),
            }))
          }
        />
      ) : (
        <InputTexto
          etiqueta="Contrasenia inicial"
          ayuda="Se genera automaticamente con CI + nombre del rol en mayusculas."
          name="contrasenia_generada"
          value={contraseniaGenerada}
          maxLength={72}
          placeholder="12345678ADMINISTRADOR"
          readOnly
          required
        />
      )}
      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
        >
          {estaEditando ? 'Guardar usuario' : 'Crear usuario'}
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
