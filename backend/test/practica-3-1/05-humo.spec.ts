import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { ClientesController } from '../../src/modules/clientes/clientes.controller';
import { ClientesService } from '../../src/modules/clientes/clientes.service';
import { PedidosController } from '../../src/modules/pedidos/pedidos.controller';
import { DetallePedidosService } from '../../src/modules/pedidos/detalle-pedidos.service';
import { PedidosService } from '../../src/modules/pedidos/pedidos.service';
import { ProductosController } from '../../src/modules/productos/productos.controller';
import { ProductosService } from '../../src/modules/productos/productos.service';
import {
  crearAppHttpPrueba,
  crearCabeceraAutorizacion,
  crearClientePrueba,
  crearPedidoPrueba,
  crearProductoPrueba,
  crearRespuestaPaginada,
  crearTokenPrueba,
} from './soporte-pruebas';

describe('P-05. Prueba de humo', () => {
  let app: INestApplication;
  const token = crearTokenPrueba();
  const servicioAuth = {
    iniciarSesion: jest.fn(),
    cerrarSesion: jest.fn(),
    obtenerPerfil: jest.fn().mockResolvedValue({
      datos: {
        id_usuario: '11111111-1111-4111-8111-111111111111',
        id_empleado: '22222222-2222-4222-8222-222222222222',
        nombre_usuario: 'ADMINPRUEBA',
        nombre_completo: 'IGNACIO ADRIAN LAYME DELGADO',
        ci_empleado: '12121212',
        rol: 'ADMINISTRADOR',
        ultima_sesion_usuario: null,
        telefono_empleado: '+59171234567',
        correo_electronico_empleado: 'empleado@prueba.com',
      },
    }),
  };
  const servicioClientes = {
    listar: jest
      .fn()
      .mockResolvedValue(crearRespuestaPaginada([crearClientePrueba()])),
  };
  const servicioProductos = {
    listar: jest
      .fn()
      .mockResolvedValue(crearRespuestaPaginada([crearProductoPrueba()])),
  };
  const servicioPedidos = {
    listar: jest.fn().mockResolvedValue(crearRespuestaPaginada([crearPedidoPrueba()])),
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
      controllers: [
        AuthController,
        ClientesController,
        ProductosController,
        PedidosController,
      ],
      providers: [
        { provide: AuthService, useValue: servicioAuth },
        { provide: ClientesService, useValue: servicioClientes },
        { provide: ProductosService, useValue: servicioProductos },
        { provide: PedidosService, useValue: servicioPedidos },
        { provide: DetallePedidosService, useValue: servicioDetalles },
      ],
    });

    app = appPrueba.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 401 controlado en auth/perfil cuando no hay sesion', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/auth/perfil');

    expect(respuesta.status).toBe(401);
    expect(respuesta.body).toMatchObject({
      exito: false,
      mensaje: expect.any(String),
    });
  });

  it('responde correctamente en clientes, productos y pedidos con sesion valida', async () => {
    const cabecera = { Authorization: crearCabeceraAutorizacion(token) };

    const [respuestaClientes, respuestaProductos, respuestaPedidos] =
      await Promise.all([
        request(app.getHttpServer()).get('/api/clientes').set(cabecera),
        request(app.getHttpServer()).get('/api/productos').set(cabecera),
        request(app.getHttpServer()).get('/api/pedidos').set(cabecera),
      ]);

    expect(respuestaClientes.status).toBe(200);
    expect(respuestaProductos.status).toBe(200);
    expect(respuestaPedidos.status).toBe(200);

    expect(respuestaClientes.body.exito).toBe(true);
    expect(respuestaProductos.body.exito).toBe(true);
    expect(respuestaPedidos.body.exito).toBe(true);
  });
});
