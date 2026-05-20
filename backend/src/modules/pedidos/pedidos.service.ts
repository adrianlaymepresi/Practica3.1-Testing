import { Injectable } from '@nestjs/common';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import { ReferenciasRepository } from '../../common/database/referencias.repository';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import {
  normalizarTextoCatalogo,
  normalizarTextoEspacios,
} from '../../common/utils/textos.util';
import { crearErrorCampo } from '../../common/utils/validacion.util';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { PedidosCatalogosRepository } from './pedidos-catalogos.repository';
import { PedidosRepository } from './pedidos.repository';

@Injectable()
export class PedidosService {
  constructor(
    private readonly pedidosRepository: PedidosRepository,
    private readonly pedidosCatalogosRepository: PedidosCatalogosRepository,
    private readonly referenciasRepository: ReferenciasRepository,
  ) {}

  listar(paginacion: PaginacionQueryDto) {
    return this.pedidosRepository.listarPedidos(paginacion);
  }

  obtenerPorId(idPedido: string) {
    return this.pedidosRepository.obtenerPedidoConRelacionesPorId(idPedido);
  }

  async crear(crearPedidoDto: CrearPedidoDto) {
    const codigoPedido = normalizarTextoCatalogo(
      crearPedidoDto.codigo_orden_pedido,
    );
    const estadoPedido = normalizarTextoCatalogo(
      crearPedidoDto.estado_orden_pedido ?? 'PENDIENTE',
    );
    const descuentoPedido = this.redondearMonto(
      crearPedidoDto.descuento_orden_pedido ?? 0,
    );

    await this.validarCodigoDisponible(codigoPedido);
    await this.validarClienteActivo(crearPedidoDto.id_cliente);
    await this.validarEmpleadoActivo(crearPedidoDto.id_empleado);
    this.validarDescuentoPedido(descuentoPedido, 0);

    const pedido = await this.pedidosRepository.crear({
      id_cliente: crearPedidoDto.id_cliente,
      id_empleado: crearPedidoDto.id_empleado,
      codigo_orden_pedido: codigoPedido,
      fecha_orden_pedido: this.normalizarFechaPedido(
        crearPedidoDto.fecha_orden_pedido,
      ),
      estado_orden_pedido: estadoPedido,
      observacion_orden_pedido: crearPedidoDto.observacion_orden_pedido
        ? normalizarTextoEspacios(crearPedidoDto.observacion_orden_pedido)
        : null,
      subtotal_orden_pedido: 0,
      descuento_orden_pedido: descuentoPedido,
      total_orden_pedido: this.calcularTotalPedido(0, descuentoPedido),
      es_activo_orden_pedido: true,
    });

    return {
      mensaje: MENSAJES.PEDIDO_CREADO,
      datos: await this.pedidosRepository.obtenerPedidoConRelacionesPorId(
        pedido.id_orden_pedido,
      ),
    };
  }

  async actualizar(idPedido: string, actualizarPedidoDto: ActualizarPedidoDto) {
    const pedidoActual = await this.pedidosRepository.obtenerPorId(idPedido);
    const subtotalActual = this.redondearMonto(
      Number(pedidoActual.subtotal_orden_pedido),
    );
    const descuentoPedido =
      actualizarPedidoDto.descuento_orden_pedido !== undefined
        ? this.redondearMonto(actualizarPedidoDto.descuento_orden_pedido)
        : this.redondearMonto(Number(pedidoActual.descuento_orden_pedido));

    if (actualizarPedidoDto.codigo_orden_pedido) {
      await this.validarCodigoDisponible(
        normalizarTextoCatalogo(actualizarPedidoDto.codigo_orden_pedido),
        idPedido,
      );
    }

    if (actualizarPedidoDto.id_cliente) {
      await this.validarClienteActivo(actualizarPedidoDto.id_cliente);
    }

    if (actualizarPedidoDto.id_empleado) {
      await this.validarEmpleadoActivo(actualizarPedidoDto.id_empleado);
    }

    this.validarDescuentoPedido(descuentoPedido, subtotalActual);

    await this.pedidosRepository.actualizar(idPedido, {
      ...(actualizarPedidoDto.id_cliente && {
        id_cliente: actualizarPedidoDto.id_cliente,
      }),
      ...(actualizarPedidoDto.id_empleado && {
        id_empleado: actualizarPedidoDto.id_empleado,
      }),
      ...(actualizarPedidoDto.codigo_orden_pedido && {
        codigo_orden_pedido: normalizarTextoCatalogo(
          actualizarPedidoDto.codigo_orden_pedido,
        ),
      }),
      ...(actualizarPedidoDto.fecha_orden_pedido && {
        fecha_orden_pedido: this.normalizarFechaPedido(
          actualizarPedidoDto.fecha_orden_pedido,
        ),
      }),
      ...(actualizarPedidoDto.estado_orden_pedido && {
        estado_orden_pedido: normalizarTextoCatalogo(
          actualizarPedidoDto.estado_orden_pedido,
        ),
      }),
      ...(actualizarPedidoDto.observacion_orden_pedido !== undefined && {
        observacion_orden_pedido: actualizarPedidoDto.observacion_orden_pedido
          ? normalizarTextoEspacios(actualizarPedidoDto.observacion_orden_pedido)
          : null,
      }),
      ...(actualizarPedidoDto.descuento_orden_pedido !== undefined && {
        descuento_orden_pedido: descuentoPedido,
      }),
      total_orden_pedido: this.calcularTotalPedido(
        subtotalActual,
        descuentoPedido,
      ),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.PEDIDO_ACTUALIZADO,
      datos: await this.pedidosRepository.obtenerPedidoConRelacionesPorId(
        idPedido,
      ),
    };
  }

  async archivar(idPedido: string) {
    await this.pedidosRepository.obtenerPorId(idPedido);

    const pedido = await this.pedidosRepository.actualizar(idPedido, {
      es_activo_orden_pedido: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_ARCHIVADO,
      datos: pedido,
    };
  }

  async reactivar(idPedido: string) {
    await this.pedidosRepository.obtenerPorId(idPedido);

    const pedido = await this.pedidosRepository.actualizar(idPedido, {
      es_activo_orden_pedido: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_REACTIVADO,
      datos: pedido,
    };
  }

  async eliminar(idPedido: string) {
    await this.pedidosRepository.obtenerPorId(idPedido);

    const totalDetalles = await this.referenciasRepository.contarPorCampo(
      'detalleorden',
      'id_orden_pedido',
      idPedido,
    );

    if (totalDetalles > 0) {
      throw ApiException.solicitudInvalida(
        'No se puede eliminar el pedido porque tiene detalles registrados',
        crearErrorCampo(
          'id_orden_pedido',
          'No puedes eliminar un pedido mientras tenga detalles registrados',
        ),
      );
    }

    await this.pedidosRepository.eliminarFisico(idPedido);

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_orden_pedido: idPedido },
    };
  }

  private async validarCodigoDisponible(
    codigoPedido: string,
    idPedidoActual?: string,
  ) {
    const existeCodigo = await this.pedidosRepository.existeCodigoPedido(
      codigoPedido,
      idPedidoActual,
    );

    if (existeCodigo) {
      throw ApiException.conflicto(
        'Ya existe un pedido con ese codigo',
        crearErrorCampo(
          'codigo_orden_pedido',
          'Ya existe un pedido con ese codigo',
        ),
      );
    }
  }

  private async validarClienteActivo(idCliente: string) {
    const cliente =
      await this.pedidosCatalogosRepository.buscarClienteActivoPorId(idCliente);

    if (!cliente) {
      throw ApiException.solicitudInvalida(
        'El cliente seleccionado no existe o no esta activo',
        crearErrorCampo(
          'id_cliente',
          'Debes seleccionar un cliente activo para el pedido',
        ),
      );
    }
  }

  private async validarEmpleadoActivo(idEmpleado: string) {
    const empleado =
      await this.pedidosCatalogosRepository.buscarEmpleadoActivoPorId(
        idEmpleado,
      );

    if (!empleado) {
      throw ApiException.solicitudInvalida(
        'El empleado seleccionado no existe o no esta activo',
        crearErrorCampo(
          'id_empleado',
          'Debes seleccionar un empleado activo para el pedido',
        ),
      );
    }
  }

  private normalizarFechaPedido(fechaPedido?: string | null) {
    if (!fechaPedido) {
      return new Date().toISOString();
    }

    const fechaNormalizada = new Date(fechaPedido);

    if (Number.isNaN(fechaNormalizada.getTime())) {
      throw ApiException.solicitudInvalida(
        'La fecha del pedido no es valida',
        crearErrorCampo(
          'fecha_orden_pedido',
          'Debes ingresar una fecha y hora valida para el pedido',
        ),
      );
    }

    return fechaNormalizada.toISOString();
  }

  private redondearMonto(valor: number) {
    return Number(Number(valor).toFixed(2));
  }

  private calcularTotalPedido(subtotal: number, descuento: number) {
    return this.redondearMonto(subtotal - descuento);
  }

  private validarDescuentoPedido(descuento: number, subtotal: number) {
    if (descuento < 0) {
      throw ApiException.solicitudInvalida(
        'El descuento del pedido no puede ser negativo',
        crearErrorCampo(
          'descuento_orden_pedido',
          'El descuento del pedido no puede ser negativo',
        ),
      );
    }

    if (descuento > subtotal) {
      throw ApiException.solicitudInvalida(
        'El descuento del pedido no puede ser mayor al subtotal actual',
        crearErrorCampo(
          'descuento_orden_pedido',
          'El descuento no puede ser mayor al subtotal actual del pedido',
        ),
      );
    }
  }
}
