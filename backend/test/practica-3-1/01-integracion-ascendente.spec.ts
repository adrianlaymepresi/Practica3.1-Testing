import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import {
  crearDetallePedidoPrueba,
  crearPedidoPrueba,
  crearProductoPrueba,
} from './soporte-pruebas';

describe('P-01. Prueba de integracion ascendente', () => {
  it('integra producto, detalle y pedido recalculando subtotal, total y stock', async () => {
    const pedidoBase = crearPedidoPrueba({
      subtotal_orden_pedido: 0,
      descuento_orden_pedido: 0,
      total_orden_pedido: 0,
    });
    const productoBase = crearProductoPrueba({
      precio_producto: 15000,
      stock_producto: 12,
    });
    const detalleCreado = crearDetallePedidoPrueba({
      id_orden_pedido: pedidoBase.id_orden_pedido,
      id_producto: productoBase.id_producto,
      cantidad_detalle_orden: 2,
      precio_unitario_detalle_orden: 15000,
      subtotal_detalle_orden: 30000,
      producto: {
        id_producto: productoBase.id_producto,
        codigo_producto: productoBase.codigo_producto,
        nombre_producto: productoBase.nombre_producto,
        precio_producto: productoBase.precio_producto,
        stock_producto: 10,
        url_imagen_producto: productoBase.url_imagen_producto,
      },
    });

    const pedidosRepository = {
      obtenerPorId: jest.fn().mockResolvedValue(pedidoBase),
      actualizar: jest.fn().mockResolvedValue({
        ...pedidoBase,
        subtotal_orden_pedido: 30000,
        total_orden_pedido: 30000,
      }),
    };
    const detallePedidosRepository = {
      existeProductoEnPedido: jest.fn().mockResolvedValue(false),
      crear: jest.fn().mockResolvedValue(detalleCreado),
      eliminarFisico: jest.fn().mockResolvedValue(undefined),
      obtenerDetalleConRelacionesPorId: jest.fn().mockResolvedValue(detalleCreado),
    };
    const pedidosCatalogosRepository = {
      buscarProductoActivoPorId: jest.fn().mockResolvedValue(productoBase),
      buscarProductoPorId: jest.fn().mockResolvedValue(productoBase),
      actualizarStockProducto: jest.fn().mockResolvedValue({
        ...productoBase,
        stock_producto: 10,
      }),
    };

    const servicio = new DetallePedidosService(
      pedidosRepository as never,
      detallePedidosRepository as never,
      pedidosCatalogosRepository as never,
    );

    const resultado = await servicio.crear(pedidoBase.id_orden_pedido, {
      id_producto: productoBase.id_producto,
      cantidad_detalle_orden: 2,
    });

    expect(detallePedidosRepository.crear).toHaveBeenCalledWith({
      id_orden_pedido: pedidoBase.id_orden_pedido,
      id_producto: productoBase.id_producto,
      cantidad_detalle_orden: 2,
      precio_unitario_detalle_orden: 15000,
      subtotal_detalle_orden: 30000,
    });
    expect(pedidosCatalogosRepository.actualizarStockProducto).toHaveBeenCalledWith(
      productoBase.id_producto,
      10,
    );
    expect(pedidosRepository.actualizar).toHaveBeenCalledWith(
      pedidoBase.id_orden_pedido,
      expect.objectContaining({
        subtotal_orden_pedido: 30000,
        descuento_orden_pedido: 0,
        total_orden_pedido: 30000,
      }),
    );
    expect(resultado.datos).toEqual(detalleCreado);
  });
});
