import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PedidosController } from '../../src/modules/pedidos/pedidos.controller';
import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { PedidosService } from '../../src/modules/pedidos/pedidos.service';
import {
  crearAppHttpPrueba,
  crearCabeceraAutorizacion,
  crearPedidoPrueba,
  crearRespuestaPaginada,
} from './soporte-pruebas';

describe('P-10. Prueba de estres y rendimiento', () => {
  let app: INestApplication;
  let token: string;
  const servicioPedidos = {
    listar: jest.fn().mockImplementation(async () =>
      crearRespuestaPaginada([
        crearPedidoPrueba({ codigo_orden_pedido: 'PEDIDO-1' }),
        crearPedidoPrueba({
          id_orden_pedido: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          codigo_orden_pedido: 'PEDIDO-2',
        }),
      ]),
    ),
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
    token = appPrueba.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('soporta un lote concurrente exigente de consultas de pedidos sin caerse', async () => {
    const totalSolicitudes = 80;
    const tamanoLote = 20;
    const inicio = Date.now();
    const respuestas = [];

    for (let indice = 0; indice < totalSolicitudes; indice += tamanoLote) {
      const lote = Array.from({ length: tamanoLote }, () =>
        request(app.getHttpServer())
          .get('/api/pedidos?pagina=1&limite=10')
          .set('Authorization', crearCabeceraAutorizacion(token)),
      );
      const respuestasLote = await Promise.all(lote);
      respuestas.push(...respuestasLote);
    }

    const duracion = Date.now() - inicio;

    expect(respuestas).toHaveLength(totalSolicitudes);
    respuestas.forEach((respuesta) => {
      expect(respuesta.status).toBe(200);
      expect(respuesta.body.exito).toBe(true);
      expect(Array.isArray(respuesta.body.datos.registros)).toBe(true);
    });
    expect(duracion).toBeLessThan(2000);
  });
});
