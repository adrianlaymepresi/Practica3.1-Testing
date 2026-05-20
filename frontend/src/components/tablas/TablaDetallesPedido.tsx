'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { formatearMontoPedido, obtenerNombreProductoPedido } from '@/src/lib/utils/pedidos';
import { DetallePedido } from '@/src/types/pedidos.types';

interface TablaDetallesPedidoProps {
  detalles: DetallePedido[];
  permiteEdicion: boolean;
  alVerDetalle: (detalle: DetallePedido) => void;
  alEditar: (detalle: DetallePedido) => void;
  alEliminar: (detalle: DetallePedido) => void;
}

export function TablaDetallesPedido({
  detalles,
  permiteEdicion,
  alVerDetalle,
  alEditar,
  alEliminar,
}: TablaDetallesPedidoProps) {
  if (detalles.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>Este pedido aun no tiene detalles</strong>
        <span>Agrega productos para que el backend calcule subtotal y total.</span>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla tabla--detalles-pedido">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio unitario</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Info</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle) => (
            <tr key={detalle.id_detalle_orden}>
              <td>
                <strong>{obtenerNombreProductoPedido(detalle.producto)}</strong>
              </td>
              <td>{formatearMontoPedido(detalle.precio_unitario_detalle_orden)}</td>
              <td>{String(detalle.cantidad_detalle_orden)}</td>
              <td>
                <strong>{formatearMontoPedido(detalle.subtotal_detalle_orden)}</strong>
              </td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<Eye size={16} />}
                  onClick={() => alVerDetalle(detalle)}
                  type="button"
                >
                  Ver info
                </Boton>
              </td>
              <td>
                <Boton
                  variante="secundario"
                  icono={<Pencil size={16} />}
                  onClick={() => alEditar(detalle)}
                  type="button"
                  disabled={!permiteEdicion}
                >
                  Editar
                </Boton>
              </td>
              <td>
                <Boton
                  variante="peligro"
                  icono={<Trash2 size={16} />}
                  onClick={() => alEliminar(detalle)}
                  type="button"
                  disabled={!permiteEdicion}
                >
                  Eliminar
                </Boton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
