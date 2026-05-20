export interface PedidoResumenCliente {
  id_cliente?: string;
  ci_cliente: string;
  nombres_completo_cliente: string;
  apellidos_completo_cliente: string;
  telefono_cliente?: string | null;
  correo_electronico_cliente?: string | null;
  direccion_cliente?: string | null;
}

export interface PedidoResumenEmpleado {
  id_empleado?: string;
  ci_empleado: string;
  nombres_completo_empleado: string;
  apellidos_completo_empleado: string;
  correo_electronico_empleado?: string;
}

export interface PedidoRegistro {
  id_orden_pedido: string;
  id_cliente: string;
  id_empleado: string;
  codigo_orden_pedido: string;
  fecha_orden_pedido: string;
  estado_orden_pedido: string;
  observacion_orden_pedido: string | null;
  subtotal_orden_pedido: number;
  descuento_orden_pedido: number;
  total_orden_pedido: number;
  es_activo_orden_pedido: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cliente?: PedidoResumenCliente | null;
  empleado?: PedidoResumenEmpleado | null;
}

export type CrearPedido = Pick<
  PedidoRegistro,
  | 'id_cliente'
  | 'id_empleado'
  | 'codigo_orden_pedido'
  | 'fecha_orden_pedido'
  | 'estado_orden_pedido'
  | 'observacion_orden_pedido'
  | 'subtotal_orden_pedido'
  | 'descuento_orden_pedido'
  | 'total_orden_pedido'
  | 'es_activo_orden_pedido'
>;

export type ActualizarPedido = Partial<CrearPedido> & {
  updated_at: string;
  deleted_at?: string | null;
};
