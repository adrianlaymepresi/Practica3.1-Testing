import { ClienteOpcion } from '@/src/types/clientes.types';
import { EmpleadoOpcion } from '@/src/types/empleados.types';
import { ProductoOpcion } from '@/src/types/productos.types';

export type EstadoPedidoNegocio = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';

export interface Pedido {
  id_orden_pedido: string;
  id_cliente: string;
  id_empleado: string;
  codigo_orden_pedido: string;
  fecha_orden_pedido: string;
  estado_orden_pedido: EstadoPedidoNegocio;
  observacion_orden_pedido: string | null;
  subtotal_orden_pedido: number;
  descuento_orden_pedido: number;
  total_orden_pedido: number;
  es_activo_orden_pedido: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cliente?: ClienteOpcion | null;
  empleado?: EmpleadoOpcion | null;
}

export interface DetallePedido {
  id_detalle_orden: string;
  id_orden_pedido: string;
  id_producto: string;
  cantidad_detalle_orden: number;
  precio_unitario_detalle_orden: number;
  subtotal_detalle_orden: number;
  created_at: string;
  updated_at: string;
  producto?: ProductoOpcion | null;
}

export interface SiguienteCodigoPedido {
  codigo_orden_pedido: string;
}

export interface CrearPedidoPayload {
  id_cliente: string;
  id_empleado: string;
  fecha_orden_pedido: string;
  observacion_orden_pedido?: string;
  descuento_orden_pedido: string;
}

export interface ActualizarPedidoPayload extends Partial<CrearPedidoPayload> {}

export interface CambiarEstadoPedidoPayload {
  estado_orden_pedido: Exclude<EstadoPedidoNegocio, 'PENDIENTE'>;
}

export interface CrearDetallePedidoPayload {
  id_producto: string;
  cantidad_detalle_orden: string;
}

export interface ActualizarDetallePedidoPayload
  extends Partial<CrearDetallePedidoPayload> {}
