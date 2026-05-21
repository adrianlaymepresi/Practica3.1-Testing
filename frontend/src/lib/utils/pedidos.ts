import type { ClienteOpcion } from '@/src/types/clientes.types';
import type { EmpleadoOpcion } from '@/src/types/empleados.types';
import type { EstadoPedidoNegocio, Pedido } from '@/src/types/pedidos.types';
import type { ProductoOpcion } from '@/src/types/productos.types';
import { formatearPrecioProducto } from '@/src/lib/utils/productos';

export const ESTADO_PEDIDO_DEFECTO = 'PENDIENTE';

export interface AccionEstadoPedido {
  etiqueta: string;
  estadoDestino: Exclude<EstadoPedidoNegocio, 'PENDIENTE'> | null;
  habilitado: boolean;
}

export function formatearMontoPedido(valor: number) {
  return formatearPrecioProducto(Number(valor));
}

export function normalizarTextoPedido(valor: string, maximo: number) {
  return valor
    .toLocaleUpperCase('es-BO')
    .replace(/\s+/g, ' ')
    .trimStart()
    .slice(0, maximo);
}

export function normalizarObservacionPedido(valor: string, maximo: number) {
  return valor.replace(/\s+/g, ' ').trimStart().slice(0, maximo);
}

export function obtenerNombreClientePedido(cliente?: ClienteOpcion | null) {
  if (!cliente) {
    return 'Sin cliente';
  }

  return `${cliente.ci_cliente} - ${cliente.nombres_completo_cliente} ${cliente.apellidos_completo_cliente}`;
}

export function obtenerNombreEmpleadoPedido(empleado?: EmpleadoOpcion | null) {
  if (!empleado) {
    return 'Sin empleado';
  }

  return `${empleado.ci_empleado} - ${empleado.nombres_completo_empleado} ${empleado.apellidos_completo_empleado}`;
}

export function obtenerNombreProductoPedido(producto?: ProductoOpcion | null) {
  if (!producto) {
    return 'Sin producto';
  }

  return `${producto.codigo_producto} - ${producto.nombre_producto}`;
}

export function esPedidoPendiente(pedido?: Pick<
  Pedido,
  'estado_orden_pedido' | 'es_activo_orden_pedido'
> | null) {
  return Boolean(
    pedido &&
      pedido.es_activo_orden_pedido &&
      pedido.estado_orden_pedido === ESTADO_PEDIDO_DEFECTO,
  );
}

export function puedeCancelarPedido(
  pedido?: Pick<
    Pedido,
    'fecha_orden_pedido' | 'estado_orden_pedido' | 'es_activo_orden_pedido'
  > | null,
) {
  if (!esPedidoPendiente(pedido)) {
    return false;
  }

  return Date.now() < new Date(pedido!.fecha_orden_pedido).getTime();
}

export function puedeCompletarPedido(
  pedido?: Pick<
    Pedido,
    'fecha_orden_pedido' | 'estado_orden_pedido' | 'es_activo_orden_pedido'
  > | null,
) {
  if (!esPedidoPendiente(pedido)) {
    return false;
  }

  return Date.now() >= new Date(pedido!.fecha_orden_pedido).getTime();
}

export function obtenerAccionEstadoPedido(pedido: Pedido): AccionEstadoPedido {
  if (!pedido.es_activo_orden_pedido) {
    return {
      etiqueta: 'Archivado',
      estadoDestino: null,
      habilitado: false,
    };
  }

  if (pedido.estado_orden_pedido === 'CANCELADO') {
    return {
      etiqueta: 'Cancelado',
      estadoDestino: null,
      habilitado: false,
    };
  }

  if (pedido.estado_orden_pedido === 'COMPLETADO') {
    return {
      etiqueta: 'Completado',
      estadoDestino: null,
      habilitado: false,
    };
  }

  if (puedeCancelarPedido(pedido)) {
    return {
      etiqueta: 'Cancelar',
      estadoDestino: 'CANCELADO',
      habilitado: true,
    };
  }

  return {
    etiqueta: 'Completar',
    estadoDestino: 'COMPLETADO',
    habilitado: true,
  };
}
