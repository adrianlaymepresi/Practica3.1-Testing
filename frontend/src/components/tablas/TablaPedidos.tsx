'use client';

import Link from 'next/link';
import {
  Archive,
  Check,
  Eye,
  FileDown,
  ListOrdered,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import {
  formatearFechaHoraZonaHoraria,
  formatearFechaSimpleZonaHoraria,
} from '@/src/lib/utils/fechas';
import {
  formatearMontoPedido,
  esPedidoPendiente,
  obtenerAccionEstadoPedido,
  obtenerNombreClientePedido,
  obtenerNombreEmpleadoPedido,
} from '@/src/lib/utils/pedidos';
import { Pedido } from '@/src/types/pedidos.types';

interface TablaPedidosProps {
  pedidos: Pedido[];
  alVerDetalle: (pedido: Pedido) => void;
  alEditar: (pedido: Pedido) => void;
  alGestionarEstadoPedido: (pedido: Pedido) => void;
  alDescargarRecibo: (pedido: Pedido) => void;
  alCambiarEstadoRegistro: (pedido: Pedido) => void;
  alEliminar: (pedido: Pedido) => void;
}

export function TablaPedidos({
  pedidos,
  alVerDetalle,
  alEditar,
  alGestionarEstadoPedido,
  alDescargarRecibo,
  alCambiarEstadoRegistro,
  alEliminar,
}: TablaPedidosProps) {
  if (pedidos.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>No hay pedidos registrados</strong>
        <span>Crea el primer pedido y luego gestiona sus detalles.</span>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla tabla--pedidos">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Empleado</th>
            <th>Estado pedido</th>
            <th>Subtotal</th>
            <th>Descuento</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Actualizado</th>
            <th>Info</th>
            <th>Editar</th>
            <th>Detalle</th>
            <th>Pedido</th>
            <th>Recibo</th>
            <th>Registro</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => {
            const accionEstado = obtenerAccionEstadoPedido(pedido);
            const puedeEditar = esPedidoPendiente(pedido);

            return (
            <tr key={pedido.id_orden_pedido}>
              <td>
                <strong>{pedido.codigo_orden_pedido}</strong>
              </td>
              <td>{formatearFechaHoraZonaHoraria(pedido.fecha_orden_pedido)}</td>
              <td>{obtenerNombreClientePedido(pedido.cliente)}</td>
              <td>{obtenerNombreEmpleadoPedido(pedido.empleado)}</td>
              <td>
                <span
                  className={`pedido-estado-negocio pedido-estado-negocio--${pedido.estado_orden_pedido.toLowerCase()}`}
                >
                  {pedido.estado_orden_pedido}
                </span>
              </td>
              <td>{formatearMontoPedido(pedido.subtotal_orden_pedido)}</td>
              <td>{formatearMontoPedido(pedido.descuento_orden_pedido)}</td>
              <td>
                <strong>{formatearMontoPedido(pedido.total_orden_pedido)}</strong>
              </td>
              <td>
                <span
                  className={`estado ${
                    pedido.es_activo_orden_pedido
                      ? 'estado--activo'
                      : 'estado--inactivo'
                  }`}
                >
                  {pedido.es_activo_orden_pedido ? 'Activo' : 'Archivado'}
                </span>
              </td>
              <td>{formatearFechaSimpleZonaHoraria(pedido.updated_at)}</td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<Eye size={16} />}
                  onClick={() => alVerDetalle(pedido)}
                  type="button"
                >
                  Ver info
                </Boton>
              </td>
              <td>
                <Boton
                  variante="secundario"
                  icono={<Pencil size={16} />}
                  onClick={() => alEditar(pedido)}
                  type="button"
                  disabled={!puedeEditar}
                >
                  Editar
                </Boton>
              </td>
              <td>
                <Link
                  className="boton boton--fantasma enlace-boton"
                  href={`/pedidos/${pedido.id_orden_pedido}/detalle`}
                >
                  <ListOrdered size={16} aria-hidden="true" />
                  <span>Gestionar</span>
                </Link>
              </td>
              <td>
                <Boton
                  icono={
                    accionEstado.estadoDestino === 'COMPLETADO' ? (
                      <Check size={16} />
                    ) : (
                      <X size={16} />
                    )
                  }
                  variante={
                    accionEstado.estadoDestino === 'CANCELADO'
                      ? 'peligro'
                      : 'secundario'
                  }
                  onClick={() => alGestionarEstadoPedido(pedido)}
                  type="button"
                  disabled={!accionEstado.habilitado}
                >
                  {accionEstado.etiqueta}
                </Boton>
              </td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<FileDown size={16} />}
                  onClick={() => alDescargarRecibo(pedido)}
                  type="button"
                >
                  PDF
                </Boton>
              </td>
              <td>
                <Boton
                  variante={
                    pedido.es_activo_orden_pedido ? 'fantasma' : 'secundario'
                  }
                  icono={
                    pedido.es_activo_orden_pedido ? (
                      <Archive size={16} />
                    ) : (
                      <RotateCcw size={16} />
                    )
                  }
                  onClick={() => alCambiarEstadoRegistro(pedido)}
                  type="button"
                >
                  {pedido.es_activo_orden_pedido ? 'Archivar' : 'Reactivar'}
                </Boton>
              </td>
              <td>
                <Boton
                  variante="peligro"
                  icono={<Trash2 size={16} />}
                  onClick={() => alEliminar(pedido)}
                  type="button"
                >
                  Eliminar
                </Boton>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
