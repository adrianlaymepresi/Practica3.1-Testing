import { solicitarApi } from '@/src/lib/api/cliente-api';
import {
  ParametrosPaginacion,
  RespuestaPaginada,
} from '@/src/types/api.types';
import {
  ActualizarDetallePedidoPayload,
  CambiarEstadoPedidoPayload,
  ActualizarPedidoPayload,
  CrearDetallePedidoPayload,
  CrearPedidoPayload,
  DetallePedido,
  Pedido,
  ReciboPedidoDatos,
  SiguienteCodigoPedido,
} from '@/src/types/pedidos.types';
import { ProductoOpcion } from '@/src/types/productos.types';

export function listarPedidos(parametros: ParametrosPaginacion) {
  return solicitarApi<RespuestaPaginada<Pedido>>('/pedidos', {
    parametros,
  });
}

export function listarProductosDisponiblesPedido(
  idPedido: string,
  idDetalleActual?: string,
) {
  return solicitarApi<ProductoOpcion[]>(
    `/pedidos/${idPedido}/productos-disponibles`,
    {
      parametros: {
        idDetalleActual,
      },
    },
  );
}

export function obtenerPedido(idPedido: string) {
  return solicitarApi<Pedido>(`/pedidos/${idPedido}`);
}

export function obtenerDatosReciboPedido(idPedido: string) {
  return solicitarApi<ReciboPedidoDatos>(`/pedidos/${idPedido}/recibo`);
}

export function obtenerSiguienteCodigoPedido() {
  return solicitarApi<SiguienteCodigoPedido>('/pedidos/siguiente-codigo');
}

export function crearPedido(datos: CrearPedidoPayload) {
  return solicitarApi<Pedido, CrearPedidoPayload>('/pedidos', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function actualizarPedido(idPedido: string, datos: ActualizarPedidoPayload) {
  return solicitarApi<Pedido, ActualizarPedidoPayload>(`/pedidos/${idPedido}`, {
    metodo: 'PATCH',
    cuerpo: datos,
  });
}

export function cambiarEstadoPedido(
  idPedido: string,
  datos: CambiarEstadoPedidoPayload,
) {
  return solicitarApi<Pedido, CambiarEstadoPedidoPayload>(
    `/pedidos/${idPedido}/estado`,
    {
      metodo: 'PATCH',
      cuerpo: datos,
    },
  );
}

export function archivarPedido(idPedido: string) {
  return solicitarApi<Pedido>(`/pedidos/${idPedido}/archivar`, {
    metodo: 'PATCH',
  });
}

export function reactivarPedido(idPedido: string) {
  return solicitarApi<Pedido>(`/pedidos/${idPedido}/reactivar`, {
    metodo: 'PATCH',
  });
}

export function eliminarPedido(idPedido: string) {
  return solicitarApi<{ id_orden_pedido: string }>(`/pedidos/${idPedido}`, {
    metodo: 'DELETE',
  });
}

export function listarDetallesPedido(
  idPedido: string,
  parametros: ParametrosPaginacion,
) {
  return solicitarApi<RespuestaPaginada<DetallePedido>>(
    `/pedidos/${idPedido}/detalles`,
    {
      parametros,
    },
  );
}

export function crearDetallePedido(
  idPedido: string,
  datos: CrearDetallePedidoPayload,
) {
  return solicitarApi<DetallePedido, CrearDetallePedidoPayload>(
    `/pedidos/${idPedido}/detalles`,
    {
      metodo: 'POST',
      cuerpo: datos,
    },
  );
}

export function actualizarDetallePedido(
  idPedido: string,
  idDetalle: string,
  datos: ActualizarDetallePedidoPayload,
) {
  return solicitarApi<DetallePedido, ActualizarDetallePedidoPayload>(
    `/pedidos/${idPedido}/detalles/${idDetalle}`,
    {
      metodo: 'PATCH',
      cuerpo: datos,
    },
  );
}

export function eliminarDetallePedido(idPedido: string, idDetalle: string) {
  return solicitarApi<{ id_detalle_orden: string }>(
    `/pedidos/${idPedido}/detalles/${idDetalle}`,
    {
      metodo: 'DELETE',
    },
  );
}
