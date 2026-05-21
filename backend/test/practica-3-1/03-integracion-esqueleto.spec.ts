import { describe, expect, it, jest } from '@jest/globals';
import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { PedidosService } from '../../src/modules/pedidos/pedidos.service';
import {
  crearClientePrueba,
  crearEmpleadoPrueba,
  crearFechaFuturaIso,
  crearMockResuelto,
  crearPedidoPrueba,
  crearProductoPrueba,
  crearUsuarioJwtPrueba,
} from './soporte-pruebas';

describe('P-03. Prueba de integracion del esqueleto', () => {
  it('ejecuta el flujo minimo cliente, pedido y detalle con stock descontado', async () => {
    const cliente = crearClientePrueba();
    const empleado = crearEmpleadoPrueba();
    const producto = crearProductoPrueba({
      precio_producto: 18000,
      stock_producto: 7,
    });
    const usuario = crearUsuarioJwtPrueba();
    let pedidoActual = crearPedidoPrueba({
      id_orden_pedido: '88888888-8888-4888-8888-888888888888',
      id_cliente: cliente.id_cliente,
      id_empleado: empleado.id_empleado,
      codigo_orden_pedido: 'BORRADOR',
      subtotal_orden_pedido: 0,
      descuento_orden_pedido: 0,
      total_orden_pedido: 0,
      cliente,
      empleado,
    });
    const detalles: Array<{
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
    }> = [];
    type DetallePedidoPrueba = (typeof detalles)[number];
    type DatosDetallePedidoPrueba = Omit<
      DetallePedidoPrueba,
      'id_detalle_orden' | 'created_at' | 'updated_at' | 'producto'
    >;

    const pedidosRepository = {
      listarPedidos: jest.fn(),
      obtenerPedidoConRelacionesPorId: jest.fn(async () => pedidoActual),
      contarPedidosRegistrados: crearMockResuelto(0),
      existeCodigoPedido: crearMockResuelto(false),
      crear: jest.fn(
        async (
          datos: Partial<typeof pedidoActual> & {
            codigo_orden_pedido: string;
          },
        ) => {
          pedidoActual = {
            ...pedidoActual,
            ...datos,
            id_orden_pedido: pedidoActual.id_orden_pedido,
            codigo_orden_pedido: datos.codigo_orden_pedido,
          };
          return pedidoActual;
        },
      ),
      obtenerPorId: jest.fn(async () => pedidoActual),
      actualizar: jest.fn(
        async (_idPedido: string, datos: Partial<typeof pedidoActual>) => {
          pedidoActual = {
            ...pedidoActual,
            ...datos,
          };
          return pedidoActual;
        },
      ),
    };
    const detallePedidosRepository = {
      listarTodosPorPedido: jest.fn(async () => detalles),
      listarDetallesPedido: jest.fn(),
      existeProductoEnPedido: jest.fn(
        async (
          _idPedido: string,
          idProducto: string,
          idDetalleActual?: string,
        ) =>
          detalles.some(
            (detalle) =>
              detalle.id_producto === idProducto &&
              detalle.id_detalle_orden !== idDetalleActual,
          ),
      ),
      crear: jest.fn(async (datos: DatosDetallePedidoPrueba) => {
        const detalleCreado: DetallePedidoPrueba = {
          id_detalle_orden: '99999999-9999-4999-8999-999999999999',
          created_at: pedidoActual.created_at,
          updated_at: pedidoActual.updated_at,
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
        detalles.push(detalleCreado);
        return detalleCreado;
      }),
      obtenerDetalleConRelacionesPorId: jest.fn(async (idDetalle: string) => {
        const detalle = detalles.find(
          (detalleActual) => detalleActual.id_detalle_orden === idDetalle,
        );

        if (!detalle) {
          throw new Error('Detalle no encontrado');
        }

        return detalle;
      }),
      actualizar: jest.fn(),
      eliminarFisico: jest.fn(),
    };
    const pedidosCatalogosRepository = {
      buscarClienteActivoPorId: jest.fn(async () => cliente),
      buscarEmpleadoActivoPorId: jest.fn(async () => empleado),
      buscarEmpleadoActivoPorUsuarioId: jest.fn(async () => empleado),
      buscarProductoActivoPorId: jest.fn(async () => producto),
      buscarProductoPorId: jest.fn(async () => producto),
      actualizarStockProducto: jest.fn(
        async (_idProducto: string, stockNuevo: number) => {
          producto.stock_producto = stockNuevo;
          return producto;
        },
      ),
    };
    const referenciasRepository = {
      contarPorCampo: crearMockResuelto(0),
    };

    const servicioPedidos = new PedidosService(
      pedidosRepository as never,
      pedidosCatalogosRepository as never,
      referenciasRepository as never,
      detallePedidosRepository as never,
    );
    const servicioDetalles = new DetallePedidosService(
      pedidosRepository as never,
      detallePedidosRepository as never,
      pedidosCatalogosRepository as never,
    );

    const pedidoCreado = await servicioPedidos.crear(
      {
        id_cliente: cliente.id_cliente,
        fecha_orden_pedido: crearFechaFuturaIso(),
        observacion_orden_pedido: 'Pedido base de integracion',
        descuento_orden_pedido: 0,
      },
      usuario,
    );

    const detalleCreado = await servicioDetalles.crear(
      pedidoActual.id_orden_pedido,
      {
        id_producto: producto.id_producto,
        cantidad_detalle_orden: 2,
      },
    );

    expect(pedidoCreado.datos.codigo_orden_pedido).toBe('PEDIDO-1');
    expect(pedidoCreado.datos.estado_orden_pedido).toBe('PENDIENTE');
    expect(detalleCreado.datos.subtotal_detalle_orden).toBe(36000);
    expect(pedidoActual.subtotal_orden_pedido).toBe(36000);
    expect(pedidoActual.total_orden_pedido).toBe(36000);
    expect(producto.stock_producto).toBe(5);
    expect(detalles).toHaveLength(1);
  });
});
