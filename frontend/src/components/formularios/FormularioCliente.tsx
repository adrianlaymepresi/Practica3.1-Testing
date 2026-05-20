'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { CampoTelefonoInternacional } from '@/src/components/comunes/CampoTelefonoInternacional';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import {
  construirTelefonoInternacional,
  descomponerTelefonoInternacional,
  limpiarTexto,
  normalizarCi,
  normalizarCorreo,
  normalizarNombrePersona,
  PATRON_CORREO_ELECTRONICO,
  PATRON_NOMBRE_PERSONA,
} from '@/src/lib/utils/formularios';
import {
  ActualizarClientePayload,
  Cliente,
  CrearClientePayload,
} from '@/src/types/clientes.types';

interface FormularioClienteProps {
  clienteEdicion?: Cliente | null;
  alCrear: (datos: CrearClientePayload) => Promise<void>;
  alActualizar: (
    idCliente: string,
    datos: ActualizarClientePayload,
  ) => Promise<void>;
  alCancelarEdicion: () => void;
}

function obtenerInicial(cliente?: Cliente | null) {
  const telefono = descomponerTelefonoInternacional(cliente?.telefono_cliente);

  return {
    ci_cliente: cliente?.ci_cliente ?? '',
    nombres_completo_cliente: cliente?.nombres_completo_cliente ?? '',
    apellidos_completo_cliente: cliente?.apellidos_completo_cliente ?? '',
    codigo_pais_telefono: telefono.codigoPais,
    numero_telefono_local: telefono.numeroLocal,
    correo_electronico_cliente: cliente?.correo_electronico_cliente ?? '',
    direccion_cliente: cliente?.direccion_cliente ?? '',
  };
}

export function FormularioCliente({
  clienteEdicion,
  alCrear,
  alActualizar,
  alCancelarEdicion,
}: FormularioClienteProps) {
  const [formulario, setFormulario] = useState(obtenerInicial(clienteEdicion));
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(clienteEdicion);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      const datos = {
        ci_cliente: formulario.ci_cliente,
        nombres_completo_cliente: formulario.nombres_completo_cliente,
        apellidos_completo_cliente: formulario.apellidos_completo_cliente,
        telefono_cliente:
          construirTelefonoInternacional(
            formulario.codigo_pais_telefono,
            formulario.numero_telefono_local,
          ) || undefined,
        correo_electronico_cliente:
          formulario.correo_electronico_cliente || undefined,
        direccion_cliente: formulario.direccion_cliente || undefined,
      };

      if (clienteEdicion) {
        await alActualizar(clienteEdicion.id_cliente, datos);
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
        etiqueta="CI cliente"
        ayuda="Obligatorio. Solo numeros enteros, entre 6 y 20 digitos."
        name="ci_cliente"
        value={formulario.ci_cliente}
        minLength={6}
        maxLength={20}
        inputMode="numeric"
        pattern="[0-9]{6,20}"
        placeholder="12345678"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            ci_cliente: normalizarCi(evento.target.value),
          }))
        }
      />
      <InputTexto
        etiqueta="Nombres"
        ayuda="Obligatorio. Solo letras y espacios. Se convierte a mayusculas."
        name="nombres_completo_cliente"
        value={formulario.nombres_completo_cliente}
        minLength={3}
        maxLength={120}
        pattern={PATRON_NOMBRE_PERSONA}
        placeholder="MARIA FERNANDA"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            nombres_completo_cliente: normalizarNombrePersona(
              evento.target.value,
            ),
          }))
        }
      />
      <InputTexto
        etiqueta="Apellidos"
        ayuda="Obligatorio. Solo letras y espacios. Se convierte a mayusculas."
        name="apellidos_completo_cliente"
        value={formulario.apellidos_completo_cliente}
        minLength={3}
        maxLength={120}
        pattern={PATRON_NOMBRE_PERSONA}
        placeholder="LOPEZ VARGAS"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            apellidos_completo_cliente: normalizarNombrePersona(
              evento.target.value,
            ),
          }))
        }
      />
      <InputTexto
        etiqueta="Correo electronico"
        ayuda="Opcional. Ejemplo: cliente@correo.com"
        name="correo_electronico_cliente"
        type="email"
        value={formulario.correo_electronico_cliente}
        maxLength={120}
        pattern={PATRON_CORREO_ELECTRONICO}
        placeholder="cliente@correo.com"
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            correo_electronico_cliente: normalizarCorreo(evento.target.value),
          }))
        }
      />
      <CampoTelefonoInternacional
        codigoPais={formulario.codigo_pais_telefono}
        numeroLocal={formulario.numero_telefono_local}
        alCambiarCodigoPais={(codigoPais) =>
          setFormulario((actual) => ({
            ...actual,
            codigo_pais_telefono: codigoPais,
          }))
        }
        alCambiarNumeroLocal={(numeroLocal) =>
          setFormulario((actual) => ({
            ...actual,
            numero_telefono_local: numeroLocal,
          }))
        }
      />
      <InputTexto
        etiqueta="Direccion"
        ayuda="Opcional. Maximo 200 caracteres."
        name="direccion_cliente"
        value={formulario.direccion_cliente}
        maxLength={200}
        placeholder="Av. Ejemplo #123, Zona Central"
        multilinea
        rows={4}
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            direccion_cliente: limpiarTexto(evento.target.value, 200),
          }))
        }
      />
      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
        >
          {estaEditando ? 'Guardar cliente' : 'Crear cliente'}
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
