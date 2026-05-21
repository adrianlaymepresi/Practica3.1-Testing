import { jest } from '@jest/globals';
import {
  INestApplication,
  Provider,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FiltroGlobalExcepciones } from '../../src/common/filters/filtro-global-excepciones';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { RespuestaInterceptor } from '../../src/common/interceptors/respuesta.interceptor';
import { UsuarioJwt } from '../../src/common/interfaces/usuario-jwt.interface';
import { crearJwtHs256 } from '../../src/common/utils/jwt.util';
import { crearExcepcionValidacion } from '../../src/common/utils/validacion.util';
import { PedidoRegistro } from '../../src/modules/pedidos/interfaces/pedido.interface';
import { DetallePedidoRegistro } from '../../src/modules/pedidos/interfaces/detalle-pedido.interface';
import { Producto } from '../../src/modules/productos/interfaces/producto.interface';
import { Cliente } from '../../src/modules/clientes/interfaces/cliente.interface';
import { Empleado } from '../../src/modules/empleados/interfaces/empleado.interface';
import {
  ROLES_SISTEMA,
  RolSistema,
} from '../../src/common/constants/roles.constant';

const FECHA_BASE = '2026-05-21T12:00:00.000Z';
const JWT_SECRETO_PRUEBA = 'secreto-jwt-pruebas';

export function crearFechaFuturaIso(horas = 48) {
  return new Date(Date.now() + horas * 60 * 60 * 1000).toISOString();
}

export function crearUsuarioJwtPrueba(
  rol: RolSistema = ROLES_SISTEMA.ADMINISTRADOR,
): UsuarioJwt {
  return {
    sub: '11111111-1111-4111-8111-111111111111',
    id_empleado: '22222222-2222-4222-8222-222222222222',
    nombre_usuario: 'ADMINPRUEBA',
    nombre_completo: 'IGNACIO ADRIAN LAYME DELGADO',
    ci_empleado: '12121212',
    rol,
  };
}

export function crearTokenPrueba(usuario = crearUsuarioJwtPrueba()) {
  return crearJwtHs256(usuario, JWT_SECRETO_PRUEBA, '1d');
}

export function crearMockResuelto<TValor>(valor: TValor) {
  return jest
    .fn<(...argumentos: unknown[]) => Promise<TValor>>()
    .mockResolvedValue(valor);
}

export function crearMockRechazado(error: unknown) {
  return jest
    .fn<(...argumentos: unknown[]) => Promise<never>>()
    .mockRejectedValue(error);
}

export function crearClientePrueba(parcial: Partial<Cliente> = {}): Cliente {
  return {
    id_cliente: '33333333-3333-4333-8333-333333333333',
    ci_cliente: '31313131',
    nombres_completo_cliente: 'DAVID MISAEL',
    apellidos_completo_cliente: 'CONDO RODRIGUEZ',
    telefono_cliente: '+59170123456',
    correo_electronico_cliente: 'cliente@prueba.com',
    direccion_cliente: 'ZONA CENTRAL',
    es_activo_cliente: true,
    created_at: FECHA_BASE,
    updated_at: FECHA_BASE,
    deleted_at: null,
    ...parcial,
  };
}

export function crearEmpleadoPrueba(parcial: Partial<Empleado> = {}): Empleado {
  return {
    id_empleado: '22222222-2222-4222-8222-222222222222',
    ci_empleado: '12121212',
    nombres_completo_empleado: 'IGNACIO ADRIAN',
    apellidos_completo_empleado: 'LAYME DELGADO',
    correo_electronico_empleado: 'empleado@prueba.com',
    fecha_nacimiento_empleado: '1998-01-20',
    telefono_empleado: '+59171234567',
    es_activo_empleado: true,
    created_at: FECHA_BASE,
    updated_at: FECHA_BASE,
    deleted_at: null,
    ...parcial,
  };
}

export function crearProductoPrueba(parcial: Partial<Producto> = {}): Producto {
  return {
    id_producto: '44444444-4444-4444-8444-444444444444',
    codigo_producto: 'APPLE-1',
    nombre_producto: '16 PRO MAX',
    descripcion_producto: 'ALMACENAMIENTO DE 512 GB',
    precio_producto: 15000,
    stock_producto: 12,
    nombre_bucket_imagen_producto: null,
    ruta_imagen_producto: null,
    url_imagen_producto: null,
    tipo_mime_imagen_producto: null,
    tamano_bytes_imagen_producto: null,
    es_activo_producto: true,
    created_at: FECHA_BASE,
    updated_at: FECHA_BASE,
    deleted_at: null,
    ...parcial,
  };
}

export function crearPedidoPrueba(
  parcial: Partial<PedidoRegistro> = {},
): PedidoRegistro {
  const cliente = parcial.cliente ?? crearClientePrueba();
  const empleado = parcial.empleado ?? crearEmpleadoPrueba();

  return {
    id_orden_pedido: '55555555-5555-4555-8555-555555555555',
    id_cliente: cliente?.id_cliente ?? '33333333-3333-4333-8333-333333333333',
    id_empleado:
      empleado?.id_empleado ?? '22222222-2222-4222-8222-222222222222',
    codigo_orden_pedido: 'PEDIDO-1',
    fecha_orden_pedido: crearFechaFuturaIso(),
    estado_orden_pedido: 'PENDIENTE',
    observacion_orden_pedido: 'Pedido de prueba',
    subtotal_orden_pedido: 0,
    descuento_orden_pedido: 0,
    total_orden_pedido: 0,
    es_activo_orden_pedido: true,
    created_at: FECHA_BASE,
    updated_at: FECHA_BASE,
    deleted_at: null,
    cliente,
    empleado,
    ...parcial,
  };
}

export function crearDetallePedidoPrueba(
  parcial: Partial<DetallePedidoRegistro> = {},
): DetallePedidoRegistro {
  const producto = parcial.producto ?? crearProductoPrueba();

  return {
    id_detalle_orden: '66666666-6666-4666-8666-666666666666',
    id_orden_pedido: '55555555-5555-4555-8555-555555555555',
    id_producto:
      producto?.id_producto ?? '44444444-4444-4444-8444-444444444444',
    cantidad_detalle_orden: 1,
    precio_unitario_detalle_orden: 15000,
    subtotal_detalle_orden: 15000,
    created_at: FECHA_BASE,
    updated_at: FECHA_BASE,
    producto,
    ...parcial,
  };
}

export function crearRespuestaPaginada<TRegistro>(registros: TRegistro[]) {
  return {
    registros,
    paginacion: {
      pagina: 1,
      limite: registros.length || 10,
      total: registros.length,
      totalPaginas: 1,
      tieneAnterior: false,
      tieneSiguiente: false,
    },
  };
}

interface OpcionesAppHttpPrueba {
  controllers: Type<unknown>[];
  providers: Provider[];
  aplicarGuards?: boolean;
}

export async function crearAppHttpPrueba({
  controllers,
  providers,
  aplicarGuards = true,
}: OpcionesAppHttpPrueba) {
  const configServicePrueba = {
    get: jest.fn((clave: string) => {
      const valores: Record<string, string> = {
        'entorno.cookies.accessToken': 'token_acceso',
        'entorno.jwt.accessSecret': JWT_SECRETO_PRUEBA,
        'entorno.jwt.accessExpiresIn': '1d',
      };

      return valores[clave];
    }),
  };

  const moduloPruebas = await Test.createTestingModule({
    controllers,
    providers: [
      ...providers,
      { provide: ConfigService, useValue: configServicePrueba },
      JwtAuthGuard,
      RolesGuard,
      Reflector,
    ],
  }).compile();

  const app = moduloPruebas.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: crearExcepcionValidacion,
    }),
  );
  app.useGlobalFilters(new FiltroGlobalExcepciones());
  app.useGlobalInterceptors(new RespuestaInterceptor());

  if (aplicarGuards) {
    app.useGlobalGuards(
      moduloPruebas.get(JwtAuthGuard),
      moduloPruebas.get(RolesGuard),
    );
  }

  await app.init();

  return {
    app,
    token: crearTokenPrueba(),
    cerrar: async () => {
      await app.close();
    },
  };
}

export function crearCabeceraAutorizacion(token: string) {
  return `Bearer ${token}`;
}

export async function cerrarAppSilenciosamente(app?: INestApplication | null) {
  if (app) {
    await app.close();
  }
}
