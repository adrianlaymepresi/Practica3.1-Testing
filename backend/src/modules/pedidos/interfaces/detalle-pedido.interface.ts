export interface DetallePedidoResumenProducto {
  id_producto?: string;
  codigo_producto: string;
  nombre_producto: string;
  precio_producto: number;
  stock_producto: number;
  url_imagen_producto: string | null;
  es_activo_producto?: boolean;
}

export interface DetallePedidoRegistro {
  id_detalle_orden: string;
  id_orden_pedido: string;
  id_producto: string;
  cantidad_detalle_orden: number;
  precio_unitario_detalle_orden: number;
  subtotal_detalle_orden: number;
  created_at: string;
  updated_at: string;
  producto?: DetallePedidoResumenProducto | null;
}

export type CrearDetallePedido = {
  id_detalle_orden?: string;
  id_orden_pedido: string;
  id_producto: string;
  cantidad_detalle_orden: number;
  precio_unitario_detalle_orden: number;
  subtotal_detalle_orden: number;
};

export type ActualizarDetallePedido = Partial<
  Omit<CrearDetallePedido, 'id_detalle_orden' | 'id_orden_pedido'>
> & {
  updated_at: string;
};
