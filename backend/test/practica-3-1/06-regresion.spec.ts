import { describe, expect, it, jest } from '@jest/globals';
import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { crearPedidoPrueba, crearProductoPrueba } from './soporte-pruebas';

describe('P-06. Prueba de regresion', () => {
  it('mantiene consistente el stock y el total cuando un detalle se crea, edita y elimina', async () => {
    const pedido = crearPedidoPrueba({
      subtotal_orden_pedido: 0,
      descuento_orden_pedido: 0,
      total_orden_pedido: 0,
    });
    const producto = crearProductoPrueba({
      precio_producto: 15000,
      stock_producto: 12,
    });
    type DetallePedidoPrueba = {
      id_detalle_orden: string;
      id_orden_pedido: string;
      id_producto: string;
      cantidad_detalle_orden: number;
      precio_unitario_detalle_orden: number;
      subtotal_detalle_orden: number;
      created_at: string;
      updated_at: string;
      producto: {
        id_producto: string;
        codigo_producto: string;
        nombre_producto: string;
        precio_producto: number;
        stock_producto: number;
        url_imagen_producto: string | null;
      };
    };
    let detalleActual: DetallePedidoPrueba | null = null;
    type DatosDetallePedidoPrueba = Omit<
      DetallePedidoPrueba,
      'id_detalle_orden' | 'created_at' | 'updated_at' | 'producto'
    >;
    type DatosActualizacionPedidoPrueba = Pick<
      typeof pedido,
      | 'subtotal_orden_pedido'
      | 'descuento_orden_pedido'
      | 'total_orden_pedido'
      | 'updated_at'
    >;

    const pedidosRepository = {
      obtenerPorId: jest.fn(async () => pedido),
      actualizar: jest.fn(
        async (_idPedido: string, datos: DatosActualizacionPedidoPrueba) => {
          pedido.subtotal_orden_pedido = datos.subtotal_orden_pedido;
          pedido.descuento_orden_pedido = datos.descuento_orden_pedido;
          pedido.total_orden_pedido = datos.total_orden_pedido;
          pedido.updated_at = datos.updated_at;
          return pedido;
        },
      ),
    };
    const detallePedidosRepository = {
      listarDetallesPedido: jest.fn(),
      existeProductoEnPedido: jest.fn(async () => false),
      crear: jest.fn(async (datos: DatosDetallePedidoPrueba) => {
        detalleActual = {
          id_detalle_orden: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          created_at: pedido.created_at,
          updated_at: pedido.updated_at,
          ...datos,
          producto: {
            id_producto: producto.id_producto,
            codigo_producto: producto.codigo_producto,
            nombre_producto: producto.nombre_producto,
            precio_producto: producto.precio_producto,
            stock_producto: producto.stock_producto,
            url_imagen_producto: producto.url_imagen_producto,
          },
        };
        return detalleActual;
      }),
      obtenerDetalleConRelacionesPorId: jest.fn(async () => {
        if (!detalleActual) {
          throw new Error('Detalle no encontrado');
        }

        return detalleActual;
      }),
      actualizar: jest.fn(
        async (
          _idDetalle: string,
          datos: Partial<DatosDetallePedidoPrueba>,
        ) => {
          if (!detalleActual) {
            throw new Error('Detalle no encontrado');
          }

          detalleActual = {
            ...detalleActual,
            ...datos,
            producto: {
              ...detalleActual.producto,
              stock_producto: producto.stock_producto,
            },
          };

          return detalleActual;
        },
      ),
      eliminarFisico: jest.fn(async () => {
        detalleActual = null;
      }),
    };
    const pedidosCatalogosRepository = {
      buscarProductoActivoPorId: jest.fn(async () => producto),
      buscarProductoPorId: jest.fn(async () => producto),
      actualizarStockProducto: jest.fn(
        async (_idProducto: string, stockNuevo: number) => {
          producto.stock_producto = stockNuevo;
          return producto;
        },
      ),
    };

    const servicio = new DetallePedidosService(
      pedidosRepository as never,
      detallePedidosRepository as never,
      pedidosCatalogosRepository as never,
    );

    await servicio.crear(pedido.id_orden_pedido, {
      id_producto: producto.id_producto,
      cantidad_detalle_orden: 2,
    });
    expect(producto.stock_producto).toBe(10);
    expect(pedido.total_orden_pedido).toBe(30000);

    await servicio.actualizar(
      pedido.id_orden_pedido,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      {
        cantidad_detalle_orden: 4,
      },
    );
    expect(producto.stock_producto).toBe(8);
    expect(pedido.total_orden_pedido).toBe(60000);

    await servicio.eliminar(
      pedido.id_orden_pedido,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
    expect(producto.stock_producto).toBe(12);
    expect(pedido.subtotal_orden_pedido).toBe(0);
    expect(pedido.total_orden_pedido).toBe(0);
    expect(detalleActual).toBeNull();
  });
});
