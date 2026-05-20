import type { ClienteOpcion } from '@/src/types/clientes.types';
import type { EmpleadoOpcion } from '@/src/types/empleados.types';
import type { ProductoOpcion } from '@/src/types/productos.types';
import { formatearPrecioProducto } from '@/src/lib/utils/productos';

export const ESTADO_PEDIDO_DEFECTO = 'PENDIENTE';

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
