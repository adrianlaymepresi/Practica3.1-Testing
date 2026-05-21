import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ProductosController } from '../../src/modules/productos/productos.controller';
import { ProductosService } from '../../src/modules/productos/productos.service';
import {
  crearAppHttpPrueba,
  crearCabeceraAutorizacion,
  crearProductoPrueba,
  crearRespuestaPaginada,
} from './soporte-pruebas';

describe('P-07. Prueba de carga', () => {
  let app: INestApplication;
  let token: string;
  const servicioProductos = {
    listar: jest
      .fn()
      .mockImplementation(async () =>
        crearRespuestaPaginada([crearProductoPrueba()]),
      ),
  };

  beforeAll(async () => {
    const appPrueba = await crearAppHttpPrueba({
      controllers: [ProductosController],
      providers: [{ provide: ProductosService, useValue: servicioProductos }],
    });

    app = appPrueba.app;
    token = appPrueba.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('atiende 50 consultas de carga normal sin errores inesperados', async () => {
    const inicio = Date.now();
    const solicitudes = Array.from({ length: 50 }, () =>
      request(app.getHttpServer())
        .get('/api/productos?pagina=1&limite=10')
        .set('Authorization', crearCabeceraAutorizacion(token)),
    );

    const respuestas = await Promise.all(solicitudes);
    const duracion = Date.now() - inicio;

    expect(respuestas).toHaveLength(50);
    respuestas.forEach((respuesta) => {
      expect(respuesta.status).toBe(200);
      expect(respuesta.body.exito).toBe(true);
    });
    expect(duracion).toBeLessThan(5000);
  });
});
