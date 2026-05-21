import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PedidosController } from '../../src/modules/pedidos/pedidos.controller';
import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { PedidosService } from '../../src/modules/pedidos/pedidos.service';
import {
  crearCabeceraAutorizacion,
  crearFechaFuturaIso,
  crearPedidoPrueba,
  crearTokenPrueba,
  crearUsuarioJwtPrueba,
  crearAppHttpPrueba,
} from './soporte-pruebas';

describe('P-04. Prueba de sanidad', () => {
  let app: INestApplication;
  const usuario = crearUsuarioJwtPrueba();
  const token = crearTokenPrueba(usuario);
  const servicioPedidos = {
    crear: jest.fn().mockResolvedValue({
      mensaje: 'Pedido creado correctamente',
      datos: crearPedidoPrueba({
        codigo_orden_pedido: 'PEDIDO-25',
        estado_orden_pedido: 'PENDIENTE',
      }),
    }),
    listar: jest.fn(),
    obtenerSiguienteCodigo: jest.fn(),
    obtenerPorId: jest.fn(),
    actualizar: jest.fn(),
    cambiarEstadoPedido: jest.fn(),
    archivar: jest.fn(),
    reactivar: jest.fn(),
    eliminar: jest.fn(),
    obtenerDatosRecibo: jest.fn(),
  };
  const servicioDetalles = {
    listar: jest.fn(),
    listarProductosDisponibles: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeAll(async () => {
    const appPrueba = await crearAppHttpPrueba({
      controllers: [PedidosController],
      providers: [
        { provide: PedidosService, useValue: servicioPedidos },
        { provide: DetallePedidosService, useValue: servicioDetalles },
      ],
    });

    app = appPrueba.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('crea un pedido basico valido y lo deja pendiente sin errores inesperados', async () => {
    const fechaPedido = crearFechaFuturaIso();

    const respuesta = await request(app.getHttpServer())
      .post('/api/pedidos')
      .set('Authorization', crearCabeceraAutorizacion(token))
      .send({
        id_cliente: '33333333-3333-4333-8333-333333333333',
        fecha_orden_pedido: fechaPedido,
        observacion_orden_pedido: 'Pedido de sanidad',
        descuento_orden_pedido: 0,
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.exito).toBe(true);
    expect(respuesta.body.datos.estado_orden_pedido).toBe('PENDIENTE');
    expect(servicioPedidos.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        id_cliente: '33333333-3333-4333-8333-333333333333',
        fecha_orden_pedido: fechaPedido,
        observacion_orden_pedido: 'Pedido de sanidad',
        descuento_orden_pedido: 0,
      }),
      expect.objectContaining({
        sub: usuario.sub,
        id_empleado: usuario.id_empleado,
      }),
    );
  });
});
