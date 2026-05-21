'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import {
  cumpleAnticipacionMinimaPedido,
  convertirFechaHoraInputLocalAUTC,
  formatearFechaHoraInputLocal,
  obtenerFechaHoraMinimaPedidoInputLocal,
} from '@/src/lib/utils/fechas';
import { normalizarDecimalNoNegativo } from '@/src/lib/utils/formularios';
import {
  ESTADO_PEDIDO_DEFECTO,
  normalizarObservacionPedido,
  obtenerNombreClientePedido,
  obtenerNombreEmpleadoPedido,
} from '@/src/lib/utils/pedidos';
import { ClienteOpcion } from '@/src/types/clientes.types';
import { EmpleadoOpcion } from '@/src/types/empleados.types';
import {
  ActualizarPedidoPayload,
  CrearPedidoPayload,
  Pedido,
} from '@/src/types/pedidos.types';

interface FormularioPedidoProps {
  pedidoEdicion?: Pedido | null;
  codigoPedido: string;
  clientes: ClienteOpcion[];
  empleados: EmpleadoOpcion[];
  alCrear: (datos: CrearPedidoPayload) => Promise<void>;
  alActualizar: (
    idPedido: string,
    datos: ActualizarPedidoPayload,
  ) => Promise<void>;
  alCancelarEdicion: () => void;
}

function obtenerInicial(pedido?: Pedido | null, codigoPedido = '') {
  return {
    id_cliente: pedido?.id_cliente ?? '',
    id_empleado: pedido?.id_empleado ?? '',
    codigo_orden_pedido: pedido?.codigo_orden_pedido ?? codigoPedido,
    fecha_orden_pedido: pedido?.fecha_orden_pedido
      ? formatearFechaHoraInputLocal(pedido.fecha_orden_pedido)
      : obtenerFechaHoraMinimaPedidoInputLocal(),
    estado_orden_pedido: pedido?.estado_orden_pedido ?? ESTADO_PEDIDO_DEFECTO,
    observacion_orden_pedido: pedido?.observacion_orden_pedido ?? '',
    descuento_orden_pedido:
      pedido?.descuento_orden_pedido !== undefined
        ? String(pedido.descuento_orden_pedido)
        : '0',
  };
}

export function FormularioPedido({
  pedidoEdicion,
  codigoPedido,
  clientes,
  empleados,
  alCrear,
  alActualizar,
  alCancelarEdicion,
}: FormularioPedidoProps) {
  const [formulario, setFormulario] = useState(
    obtenerInicial(pedidoEdicion, codigoPedido),
  );
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(pedidoEdicion);
  const fechaMinimaPedido = estaEditando
    ? undefined
    : obtenerFechaHoraMinimaPedidoInputLocal();

  useEffect(() => {
    setFormulario(obtenerInicial(pedidoEdicion, codigoPedido));
  }, [codigoPedido, pedidoEdicion]);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      const fechaOriginalFormateada = pedidoEdicion?.fecha_orden_pedido
        ? formatearFechaHoraInputLocal(pedidoEdicion.fecha_orden_pedido)
        : '';
      const fechaCambio =
        !pedidoEdicion ||
        formulario.fecha_orden_pedido !== fechaOriginalFormateada;

      if (
        fechaCambio &&
        !cumpleAnticipacionMinimaPedido(formulario.fecha_orden_pedido)
      ) {
        throw new Error(
          'La fecha del pedido debe programarse con al menos 24 horas exactas de anticipacion.',
        );
      }

      if (pedidoEdicion) {
        const datosActualizacion: ActualizarPedidoPayload = {
          id_cliente: formulario.id_cliente,
          id_empleado: formulario.id_empleado,
          ...(fechaCambio && {
            fecha_orden_pedido: convertirFechaHoraInputLocalAUTC(
              formulario.fecha_orden_pedido,
            ),
          }),
          observacion_orden_pedido:
            formulario.observacion_orden_pedido || undefined,
          descuento_orden_pedido: formulario.descuento_orden_pedido,
        };

        await alActualizar(pedidoEdicion.id_orden_pedido, datosActualizacion);
        alCancelarEdicion();
      } else {
        const datosCreacion: CrearPedidoPayload = {
          id_cliente: formulario.id_cliente,
          id_empleado: formulario.id_empleado,
          fecha_orden_pedido: convertirFechaHoraInputLocalAUTC(
            formulario.fecha_orden_pedido,
          ),
          observacion_orden_pedido:
            formulario.observacion_orden_pedido || undefined,
          descuento_orden_pedido: formulario.descuento_orden_pedido,
        };

        await alCrear(datosCreacion);
        setFormulario(obtenerInicial(null, codigoPedido));
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario formulario-grid" onSubmit={manejarEnvio}>
      <label className="campo">
        <span className="campo__etiqueta">
          Cliente
          <small>Obligatorio</small>
        </span>
        <select
          className="campo__control"
          value={formulario.id_cliente}
          required
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              id_cliente: evento.target.value,
            }))
          }
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id_cliente} value={cliente.id_cliente}>
              {obtenerNombreClientePedido(cliente)}
            </option>
          ))}
        </select>
        <span className="campo__ayuda">
          Obligatorio. Solo se muestran clientes activos.
        </span>
      </label>
      <label className="campo">
        <span className="campo__etiqueta">
          Empleado
          <small>Obligatorio</small>
        </span>
        <select
          className="campo__control"
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
              {obtenerNombreEmpleadoPedido(empleado)}
            </option>
          ))}
        </select>
        <span className="campo__ayuda">
          Obligatorio. Solo se muestran empleados activos.
        </span>
      </label>
      <InputTexto
        etiqueta="Codigo del pedido"
        ayuda="Generado automaticamente por el sistema con el formato PEDIDO-NUMERO."
        name="codigo_orden_pedido"
        value={formulario.codigo_orden_pedido}
        placeholder="PEDIDO-1"
        required
        readOnly
        disabled
      />
      <InputTexto
        etiqueta="Fecha del pedido"
        ayuda="Obligatorio. Debe programarse con 24 horas exactas de anticipacion minima en horario de Bolivia y se guardara en UTC."
        name="fecha_orden_pedido"
        type="datetime-local"
        value={formulario.fecha_orden_pedido}
        min={fechaMinimaPedido}
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            fecha_orden_pedido: evento.target.value,
          }))
        }
      />
      <InputTexto
        etiqueta="Estado del pedido"
        ayuda="Se crea automaticamente como PENDIENTE. Luego podras cambiarlo a CANCELADO o COMPLETADO desde la tabla."
        name="estado_orden_pedido"
        value={formulario.estado_orden_pedido}
        placeholder="PENDIENTE"
        required
        readOnly
        disabled
      />
      <InputTexto
        etiqueta="Descuento"
        ayuda="Obligatorio. No puede ser negativo ni superar el subtotal actual del pedido."
        name="descuento_orden_pedido"
        value={formulario.descuento_orden_pedido}
        inputMode="decimal"
        placeholder="0"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            descuento_orden_pedido: normalizarDecimalNoNegativo(
              evento.target.value,
            ),
          }))
        }
      />
      <InputTexto
        className="formulario__campo-completo"
        etiqueta="Observacion"
        ayuda="Opcional. Maximo 300 caracteres."
        name="observacion_orden_pedido"
        value={formulario.observacion_orden_pedido}
        maxLength={300}
        placeholder="Observacion operativa del pedido"
        multilinea
        rows={4}
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            observacion_orden_pedido: normalizarObservacionPedido(
              evento.target.value,
              300,
            ),
          }))
        }
      />
      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
          disabled={!formulario.codigo_orden_pedido}
        >
          {estaEditando ? 'Guardar pedido' : 'Crear pedido'}
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
