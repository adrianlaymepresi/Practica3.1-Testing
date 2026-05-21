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
import { DetallePedidosRepository } from './detalle-pedidos.repository';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { PedidosCatalogosRepository } from './pedidos-catalogos.repository';
import { PedidosRepository } from './pedidos.repository';

const ESTADO_PEDIDO_PENDIENTE = 'PENDIENTE';
const ESTADO_PEDIDO_COMPLETADO = 'COMPLETADO';
const ESTADO_PEDIDO_CANCELADO = 'CANCELADO';
const ESTADOS_PEDIDO_VALIDOS = [
  ESTADO_PEDIDO_PENDIENTE,
  ESTADO_PEDIDO_COMPLETADO,
  ESTADO_PEDIDO_CANCELADO,
] as const;
const MILISEGUNDOS_ANTICIPACION_PEDIDO = 24 * 60 * 60 * 1000;

@Injectable()
export class PedidosService {
  constructor(
    private readonly pedidosRepository: PedidosRepository,
    private readonly pedidosCatalogosRepository: PedidosCatalogosRepository,
    private readonly referenciasRepository: ReferenciasRepository,
    private readonly detallePedidosRepository: DetallePedidosRepository,
  ) {}

  listar(paginacion: PaginacionQueryDto) {
    return this.pedidosRepository.listarPedidos(paginacion);
  }

  obtenerPorId(idPedido: string) {
    return this.pedidosRepository.obtenerPedidoConRelacionesPorId(idPedido);
  }

  async obtenerSiguienteCodigo() {
    return {
      codigo_orden_pedido: await this.generarCodigoPedido(),
    };
  }

  async crear(crearPedidoDto: CrearPedidoDto) {
    const descuentoPedido = this.redondearMonto(
      crearPedidoDto.descuento_orden_pedido ?? 0,
    );
    const codigoPedido = await this.generarCodigoPedido();

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
      estado_orden_pedido: ESTADO_PEDIDO_PENDIENTE,
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
    this.validarPedidoEditable(pedidoActual);

    const subtotalActual = this.redondearMonto(
      Number(pedidoActual.subtotal_orden_pedido),
    );
    const descuentoPedido =
      actualizarPedidoDto.descuento_orden_pedido !== undefined
        ? this.redondearMonto(actualizarPedidoDto.descuento_orden_pedido)
        : this.redondearMonto(Number(pedidoActual.descuento_orden_pedido));

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
      ...(actualizarPedidoDto.fecha_orden_pedido && {
        fecha_orden_pedido: this.normalizarFechaPedido(
          actualizarPedidoDto.fecha_orden_pedido,
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

  async cambiarEstadoPedido(idPedido: string, estadoDestinoRecibido: string) {
    const pedidoActual = await this.pedidosRepository.obtenerPorId(idPedido);
    this.validarPedidoActivo(pedidoActual);
    this.validarPedidoPendiente(pedidoActual);

    const estadoDestino = normalizarTextoCatalogo(estadoDestinoRecibido);

    if (
      estadoDestino !== ESTADO_PEDIDO_COMPLETADO &&
      estadoDestino !== ESTADO_PEDIDO_CANCELADO
    ) {
      throw ApiException.solicitudInvalida(
        'El estado solicitado para el pedido no es valido',
        crearErrorCampo(
          'estado_orden_pedido',
          'Solo puedes cambiar el pedido a COMPLETADO o CANCELADO',
        ),
      );
    }

    if (estadoDestino === ESTADO_PEDIDO_CANCELADO) {
      this.validarPedidoAntesDeFecha(pedidoActual.fecha_orden_pedido);
      await this.restaurarStockPorCancelacion(idPedido);
    }

    if (estadoDestino === ESTADO_PEDIDO_COMPLETADO) {
      this.validarPedidoDespuesDeFecha(pedidoActual.fecha_orden_pedido);
    }

    await this.pedidosRepository.actualizar(idPedido, {
      estado_orden_pedido: estadoDestino,
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.PEDIDO_ESTADO_ACTUALIZADO,
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

  private async generarCodigoPedido() {
    const totalPedidos = await this.pedidosRepository.contarPedidosRegistrados();
    let numeroPedido = totalPedidos + 1;
    let codigoPedido = `PEDIDO-${numeroPedido}`;

    while (await this.pedidosRepository.existeCodigoPedido(codigoPedido)) {
      numeroPedido += 1;
      codigoPedido = `PEDIDO-${numeroPedido}`;
    }

    return codigoPedido;
  }

  private async restaurarStockPorCancelacion(idPedido: string) {
    const detalles = await this.detallePedidosRepository.listarTodosPorPedido(
      idPedido,
    );

    if (detalles.length === 0) {
      return;
    }

    const restauraciones: Array<{ idProducto: string; stockOriginal: number }> =
      [];

    try {
      for (const detalle of detalles) {
        const producto = await this.obtenerProductoPorIdValidado(
          detalle.id_producto,
        );
        const stockOriginal = Number(producto.stock_producto);

        await this.pedidosCatalogosRepository.actualizarStockProducto(
          producto.id_producto,
          stockOriginal + detalle.cantidad_detalle_orden,
        );

        restauraciones.push({
          idProducto: producto.id_producto,
          stockOriginal,
        });
      }
    } catch (error) {
      for (const restauracion of restauraciones.reverse()) {
        try {
          await this.pedidosCatalogosRepository.actualizarStockProducto(
            restauracion.idProducto,
            restauracion.stockOriginal,
          );
        } catch {}
      }

      throw error;
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

  private async obtenerProductoPorIdValidado(idProducto: string) {
    const producto = await this.pedidosCatalogosRepository.buscarProductoPorId(
      idProducto,
    );

    if (!producto) {
      throw ApiException.solicitudInvalida(
        'No se encontro el producto vinculado al pedido',
        crearErrorCampo(
          'id_producto',
          'No se encontro el producto vinculado al pedido',
        ),
      );
    }

    return producto;
  }

  private normalizarFechaPedido(fechaPedido: string) {
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

    const diferenciaMilisegundos =
      fechaNormalizada.getTime() - Date.now();

    if (diferenciaMilisegundos < MILISEGUNDOS_ANTICIPACION_PEDIDO) {
      throw ApiException.solicitudInvalida(
        'La fecha del pedido debe tener al menos 24 horas exactas de anticipacion',
        crearErrorCampo(
          'fecha_orden_pedido',
          'La fecha del pedido debe programarse con al menos 24 horas exactas de anticipacion',
        ),
      );
    }

    return fechaNormalizada.toISOString();
  }

  private validarPedidoActivo(pedido: {
    es_activo_orden_pedido: boolean;
    deleted_at: string | null;
  }) {
    if (!pedido.es_activo_orden_pedido || pedido.deleted_at) {
      throw ApiException.solicitudInvalida(
        'No puedes gestionar un pedido archivado',
        crearErrorCampo(
          'id_orden_pedido',
          'Reactiva el pedido antes de continuar con esta operacion',
        ),
      );
    }
  }

  private validarPedidoPendiente(pedido: { estado_orden_pedido: string }) {
    const estadoActual = normalizarTextoCatalogo(pedido.estado_orden_pedido);
    const estadoEsValido = ESTADOS_PEDIDO_VALIDOS.some(
      (estado) => estado === estadoActual,
    );

    if (!estadoEsValido) {
      throw ApiException.solicitudInvalida(
        'El estado actual del pedido no es valido',
        crearErrorCampo(
          'estado_orden_pedido',
          'El pedido tiene un estado no reconocido por el sistema',
        ),
      );
    }

    if (estadoActual !== ESTADO_PEDIDO_PENDIENTE) {
      throw ApiException.solicitudInvalida(
        'Solo puedes cambiar pedidos que aun estan pendientes',
        crearErrorCampo(
          'estado_orden_pedido',
          'Solo puedes gestionar pedidos que aun estan en estado PENDIENTE',
        ),
      );
    }
  }

  private validarPedidoEditable(pedido: {
    es_activo_orden_pedido: boolean;
    deleted_at: string | null;
    estado_orden_pedido: string;
  }) {
    this.validarPedidoActivo(pedido);
    this.validarPedidoPendiente(pedido);
  }

  private validarPedidoAntesDeFecha(fechaPedido: string) {
    const fechaObjetivo = new Date(fechaPedido);

    if (Date.now() >= fechaObjetivo.getTime()) {
      throw ApiException.solicitudInvalida(
        'Solo puedes cancelar pedidos antes de la fecha programada',
        crearErrorCampo(
          'estado_orden_pedido',
          'El pedido ya alcanzo su fecha programada y ya no puede cancelarse',
        ),
      );
    }
  }

  private validarPedidoDespuesDeFecha(fechaPedido: string) {
    const fechaObjetivo = new Date(fechaPedido);

    if (Date.now() < fechaObjetivo.getTime()) {
      throw ApiException.solicitudInvalida(
        'Solo puedes completar pedidos cuando su fecha programada ya se cumplio',
        crearErrorCampo(
          'estado_orden_pedido',
          'El pedido solo puede marcarse como COMPLETADO despues de llegar a la fecha y hora programadas',
        ),
      );
    }
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
