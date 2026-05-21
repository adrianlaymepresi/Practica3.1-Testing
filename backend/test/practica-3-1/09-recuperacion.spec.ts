import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { crearPedidoPrueba, crearProductoPrueba } from './soporte-pruebas';

describe('P-09. Prueba de recuperacion', () => {
  it('responde de forma controlada y revierte el detalle si falla la actualizacion de stock', async () => {
    const pedido = crearPedidoPrueba({
      subtotal_orden_pedido: 0,
      descuento_orden_pedido: 0,
      total_orden_pedido: 0,
    });
    const producto = crearProductoPrueba({
      stock_producto: 8,
      precio_producto: 21000,
    });

    const pedidosRepository = {
      obtenerPorId: jest.fn().mockResolvedValue(pedido),
      actualizar: jest.fn(),
    };
    const detallePedidosRepository = {
      existeProductoEnPedido: jest.fn().mockResolvedValue(false),
      crear: jest.fn().mockResolvedValue({
        id_detalle_orden: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        id_orden_pedido: pedido.id_orden_pedido,
        id_producto: producto.id_producto,
        cantidad_detalle_orden: 2,
        precio_unitario_detalle_orden: 21000,
        subtotal_detalle_orden: 42000,
      }),
      eliminarFisico: jest.fn().mockResolvedValue(undefined),
      obtenerDetalleConRelacionesPorId: jest.fn(),
    };
    const pedidosCatalogosRepository = {
      buscarProductoActivoPorId: jest.fn().mockResolvedValue(producto),
      buscarProductoPorId: jest.fn().mockResolvedValue(producto),
      actualizarStockProducto: jest
        .fn()
        .mockRejectedValueOnce(new Error('Fallo temporal de Supabase'))
        .mockResolvedValueOnce(producto),
    };

    const servicio = new DetallePedidosService(
      pedidosRepository as never,
      detallePedidosRepository as never,
      pedidosCatalogosRepository as never,
    );

    await expect(
      servicio.crear(pedido.id_orden_pedido, {
        id_producto: producto.id_producto,
        cantidad_detalle_orden: 2,
      }),
    ).rejects.toThrow('Fallo temporal de Supabase');

    expect(detallePedidosRepository.crear).toHaveBeenCalledTimes(1);
    expect(detallePedidosRepository.eliminarFisico).toHaveBeenCalledWith(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    );
    expect(pedidosCatalogosRepository.actualizarStockProducto).toHaveBeenNthCalledWith(
      2,
      producto.id_producto,
      8,
    );
    expect(pedidosRepository.actualizar).not.toHaveBeenCalled();
  });
});
