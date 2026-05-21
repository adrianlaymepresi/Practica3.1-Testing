import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { HttpException } from '@nestjs/common';
import { crearPedidoPrueba, crearProductoPrueba } from './soporte-pruebas';

describe('P-02. Prueba de integracion ad hoc', () => {
  it('permite usar un producto activo con stock dentro de un detalle de pedido', async () => {
    const pedidoBase = crearPedidoPrueba();
    const productoBase = crearProductoPrueba({
      stock_producto: 5,
      precio_producto: 21000,
    });

    const pedidosRepository = {
      obtenerPorId: jest.fn().mockResolvedValue(pedidoBase),
      actualizar: jest.fn().mockResolvedValue(undefined),
    };
    const detallePedidosRepository = {
      existeProductoEnPedido: jest.fn().mockResolvedValue(false),
      crear: jest.fn().mockResolvedValue({
        id_detalle_orden: '77777777-7777-4777-8777-777777777777',
      }),
      eliminarFisico: jest.fn().mockResolvedValue(undefined),
      obtenerDetalleConRelacionesPorId: jest.fn().mockResolvedValue({
        id_detalle_orden: '77777777-7777-4777-8777-777777777777',
        id_orden_pedido: pedidoBase.id_orden_pedido,
        id_producto: productoBase.id_producto,
        cantidad_detalle_orden: 1,
        precio_unitario_detalle_orden: 21000,
        subtotal_detalle_orden: 21000,
        created_at: pedidoBase.created_at,
        updated_at: pedidoBase.updated_at,
        producto: {
          id_producto: productoBase.id_producto,
          codigo_producto: productoBase.codigo_producto,
          nombre_producto: productoBase.nombre_producto,
          precio_producto: productoBase.precio_producto,
          stock_producto: 4,
          url_imagen_producto: productoBase.url_imagen_producto,
        },
      }),
    };
    const pedidosCatalogosRepository = {
      buscarProductoActivoPorId: jest.fn().mockResolvedValue(productoBase),
      buscarProductoPorId: jest.fn().mockResolvedValue(productoBase),
      actualizarStockProducto: jest.fn().mockResolvedValue({
        ...productoBase,
        stock_producto: 4,
      }),
    };

    const servicio = new DetallePedidosService(
      pedidosRepository as never,
      detallePedidosRepository as never,
      pedidosCatalogosRepository as never,
    );

    const resultado = await servicio.crear(pedidoBase.id_orden_pedido, {
      id_producto: productoBase.id_producto,
      cantidad_detalle_orden: 1,
    });

    expect(resultado.datos.precio_unitario_detalle_orden).toBe(21000);
    expect(pedidosCatalogosRepository.actualizarStockProducto).toHaveBeenCalledWith(
      productoBase.id_producto,
      4,
    );
  });

  it('bloquea el uso del producto cuando no tiene stock disponible', async () => {
    const pedidoBase = crearPedidoPrueba();
    const productoSinStock = crearProductoPrueba({
      stock_producto: 0,
    });

    const pedidosRepository = {
      obtenerPorId: jest.fn().mockResolvedValue(pedidoBase),
      actualizar: jest.fn(),
    };
    const detallePedidosRepository = {
      existeProductoEnPedido: jest.fn().mockResolvedValue(false),
      crear: jest.fn(),
      eliminarFisico: jest.fn(),
      obtenerDetalleConRelacionesPorId: jest.fn(),
    };
    const pedidosCatalogosRepository = {
      buscarProductoActivoPorId: jest.fn().mockResolvedValue(productoSinStock),
      buscarProductoPorId: jest.fn().mockResolvedValue(productoSinStock),
      actualizarStockProducto: jest.fn(),
    };

    const servicio = new DetallePedidosService(
      pedidosRepository as never,
      detallePedidosRepository as never,
      pedidosCatalogosRepository as never,
    );

    const promesa = servicio.crear(pedidoBase.id_orden_pedido, {
        id_producto: productoSinStock.id_producto,
        cantidad_detalle_orden: 1,
      });

    await expect(promesa).rejects.toBeInstanceOf(HttpException);
    await expect(promesa).rejects.toMatchObject({
      response: expect.objectContaining({
        mensaje: 'No hay stock suficiente para registrar esa cantidad',
      }),
    });

    expect(detallePedidosRepository.crear).not.toHaveBeenCalled();
    expect(pedidosCatalogosRepository.actualizarStockProducto).not.toHaveBeenCalled();
  });
});
