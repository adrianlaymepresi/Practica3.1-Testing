import { Injectable } from '@nestjs/common';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { crearErrorCampo } from '../../common/utils/validacion.util';
import { ActualizarDetallePedidoDto } from './dto/actualizar-detalle-pedido.dto';
import { CrearDetallePedidoDto } from './dto/crear-detalle-pedido.dto';
import { DetallePedidosRepository } from './detalle-pedidos.repository';
import { PedidosCatalogosRepository } from './pedidos-catalogos.repository';
import { PedidosRepository } from './pedidos.repository';

@Injectable()
export class DetallePedidosService {
  constructor(
    private readonly pedidosRepository: PedidosRepository,
    private readonly detallePedidosRepository: DetallePedidosRepository,
    private readonly pedidosCatalogosRepository: PedidosCatalogosRepository,
  ) {}

  async listar(idPedido: string, paginacion: PaginacionQueryDto) {
    await this.pedidosRepository.obtenerPorId(idPedido);
    return this.detallePedidosRepository.listarDetallesPedido(idPedido, paginacion);
  }

  async listarProductosDisponibles(idPedido: string, idDetalleActual?: string) {
    await this.pedidosRepository.obtenerPorId(idPedido);

    if (idDetalleActual) {
      const detalle =
        await this.detallePedidosRepository.obtenerDetalleConRelacionesPorId(
          idDetalleActual,
        );

      if (detalle.id_orden_pedido !== idPedido) {
        throw ApiException.noEncontrado('No se encontro el detalle solicitado');
      }
    }

    return {
      datos: await this.pedidosCatalogosRepository.listarProductosDisponiblesParaPedido(
        idPedido,
        idDetalleActual,
      ),
    };
  }

  async crear(idPedido: string, crearDetallePedidoDto: CrearDetallePedidoDto) {
    const pedido = await this.obtenerPedidoGestionable(idPedido);
    const producto = await this.obtenerProductoActivoValidado(
      crearDetallePedidoDto.id_producto,
    );
    const cantidad = crearDetallePedidoDto.cantidad_detalle_orden;
    const subtotalPedidoActual = this.redondearMonto(
      Number(pedido.subtotal_orden_pedido),
    );
    const descuentoPedidoActual = this.redondearMonto(
      Number(pedido.descuento_orden_pedido),
    );

    await this.validarProductoNoDuplicado(idPedido, producto.id_producto);
    this.validarStockDisponible(Number(producto.stock_producto), cantidad);

    const precioUnitario = this.redondearMonto(Number(producto.precio_producto));
    const subtotalDetalle = this.calcularSubtotalDetalle(
      cantidad,
      precioUnitario,
    );
    const subtotalPedidoNuevo = this.redondearMonto(
      subtotalPedidoActual + subtotalDetalle,
    );
    this.validarDescuentoPedido(descuentoPedidoActual, subtotalPedidoNuevo);

    const detalle = await this.detallePedidosRepository.crear({
      id_orden_pedido: idPedido,
      id_producto: producto.id_producto,
      cantidad_detalle_orden: cantidad,
      precio_unitario_detalle_orden: precioUnitario,
      subtotal_detalle_orden: subtotalDetalle,
    });

    try {
      await this.pedidosCatalogosRepository.actualizarStockProducto(
        producto.id_producto,
        Number(producto.stock_producto) - cantidad,
      );
      await this.actualizarResumenPedido(
        idPedido,
        subtotalPedidoNuevo,
        descuentoPedidoActual,
      );
    } catch (error) {
      try {
        await this.detallePedidosRepository.eliminarFisico(
          detalle.id_detalle_orden,
        );
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          producto.id_producto,
          Number(producto.stock_producto),
        );
      } catch {}

      throw error;
    }

    return {
      mensaje: MENSAJES.DETALLE_PEDIDO_CREADO,
      datos: await this.detallePedidosRepository.obtenerDetalleConRelacionesPorId(
        detalle.id_detalle_orden,
      ),
    };
  }

  async actualizar(
    idPedido: string,
    idDetalle: string,
    actualizarDetallePedidoDto: ActualizarDetallePedidoDto,
  ) {
    const pedido = await this.obtenerPedidoGestionable(idPedido);
    const detalleAnterior =
      await this.detallePedidosRepository.obtenerDetalleConRelacionesPorId(
        idDetalle,
      );

    if (detalleAnterior.id_orden_pedido !== idPedido) {
      throw ApiException.noEncontrado('No se encontro el detalle solicitado');
    }

    const idProductoObjetivo =
      actualizarDetallePedidoDto.id_producto ?? detalleAnterior.id_producto;
    const cantidadObjetivo =
      actualizarDetallePedidoDto.cantidad_detalle_orden ??
      detalleAnterior.cantidad_detalle_orden;
    const subtotalPedidoActual = this.redondearMonto(
      Number(pedido.subtotal_orden_pedido),
    );
    const descuentoPedidoActual = this.redondearMonto(
      Number(pedido.descuento_orden_pedido),
    );

    const productoAnterior = await this.obtenerProductoPorIdValidado(
      detalleAnterior.id_producto,
    );
    const productoObjetivo = await this.obtenerProductoActivoValidado(
      idProductoObjetivo,
    );
    const precioUnitarioNuevo = this.redondearMonto(
      Number(productoObjetivo.precio_producto),
    );
    const subtotalDetalleNuevo = this.calcularSubtotalDetalle(
      cantidadObjetivo,
      precioUnitarioNuevo,
    );
    const subtotalPedidoNuevo = this.redondearMonto(
      subtotalPedidoActual -
        this.redondearMonto(Number(detalleAnterior.subtotal_detalle_orden)) +
        subtotalDetalleNuevo,
    );

    if (productoObjetivo.id_producto !== detalleAnterior.id_producto) {
      await this.validarProductoNoDuplicado(
        idPedido,
        productoObjetivo.id_producto,
        idDetalle,
      );
    }

    this.validarDescuentoPedido(descuentoPedidoActual, subtotalPedidoNuevo);

    if (productoObjetivo.id_producto === detalleAnterior.id_producto) {
      const stockOriginal = Number(productoObjetivo.stock_producto);
      const stockDisponible =
        stockOriginal + detalleAnterior.cantidad_detalle_orden;
      const stockFinal = stockDisponible - cantidadObjetivo;

      this.validarStockDisponible(stockDisponible, cantidadObjetivo);

      await this.pedidosCatalogosRepository.actualizarStockProducto(
        productoObjetivo.id_producto,
        stockFinal,
      );

      try {
        await this.detallePedidosRepository.actualizar(idDetalle, {
          id_producto: productoObjetivo.id_producto,
          cantidad_detalle_orden: cantidadObjetivo,
          precio_unitario_detalle_orden: precioUnitarioNuevo,
          subtotal_detalle_orden: subtotalDetalleNuevo,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoObjetivo.id_producto,
          stockOriginal,
        );
        throw error;
      }

      try {
        await this.actualizarResumenPedido(
          idPedido,
          subtotalPedidoNuevo,
          descuentoPedidoActual,
        );
      } catch (error) {
        await this.detallePedidosRepository.actualizar(idDetalle, {
          id_producto: detalleAnterior.id_producto,
          cantidad_detalle_orden: detalleAnterior.cantidad_detalle_orden,
          precio_unitario_detalle_orden: this.redondearMonto(
            Number(detalleAnterior.precio_unitario_detalle_orden),
          ),
          subtotal_detalle_orden: this.redondearMonto(
            Number(detalleAnterior.subtotal_detalle_orden),
          ),
          updated_at: new Date().toISOString(),
        });
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoObjetivo.id_producto,
          stockOriginal,
        );
        throw error;
      }
    } else {
      const stockAnteriorOriginal = Number(productoAnterior.stock_producto);
      const stockNuevoOriginal = Number(productoObjetivo.stock_producto);
      const stockAnteriorFinal =
        stockAnteriorOriginal + detalleAnterior.cantidad_detalle_orden;
      const stockNuevoFinal = stockNuevoOriginal - cantidadObjetivo;

      this.validarStockDisponible(stockNuevoOriginal, cantidadObjetivo);

      await this.pedidosCatalogosRepository.actualizarStockProducto(
        productoAnterior.id_producto,
        stockAnteriorFinal,
      );

      try {
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoObjetivo.id_producto,
          stockNuevoFinal,
        );
      } catch (error) {
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoAnterior.id_producto,
          stockAnteriorOriginal,
        );
        throw error;
      }

      try {
        await this.detallePedidosRepository.actualizar(idDetalle, {
          id_producto: productoObjetivo.id_producto,
          cantidad_detalle_orden: cantidadObjetivo,
          precio_unitario_detalle_orden: precioUnitarioNuevo,
          subtotal_detalle_orden: subtotalDetalleNuevo,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoAnterior.id_producto,
          stockAnteriorOriginal,
        );
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoObjetivo.id_producto,
          stockNuevoOriginal,
        );
        throw error;
      }

      try {
        await this.actualizarResumenPedido(
          idPedido,
          subtotalPedidoNuevo,
          descuentoPedidoActual,
        );
      } catch (error) {
        await this.detallePedidosRepository.actualizar(idDetalle, {
          id_producto: detalleAnterior.id_producto,
          cantidad_detalle_orden: detalleAnterior.cantidad_detalle_orden,
          precio_unitario_detalle_orden: this.redondearMonto(
            Number(detalleAnterior.precio_unitario_detalle_orden),
          ),
          subtotal_detalle_orden: this.redondearMonto(
            Number(detalleAnterior.subtotal_detalle_orden),
          ),
          updated_at: new Date().toISOString(),
        });
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoAnterior.id_producto,
          stockAnteriorOriginal,
        );
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          productoObjetivo.id_producto,
          stockNuevoOriginal,
        );
        throw error;
      }
    }

    return {
      mensaje: MENSAJES.DETALLE_PEDIDO_ACTUALIZADO,
      datos: await this.detallePedidosRepository.obtenerDetalleConRelacionesPorId(
        idDetalle,
      ),
    };
  }

  async eliminar(idPedido: string, idDetalle: string) {
    const pedido = await this.obtenerPedidoGestionable(idPedido);
    const detalle =
      await this.detallePedidosRepository.obtenerDetalleConRelacionesPorId(
        idDetalle,
      );

    if (detalle.id_orden_pedido !== idPedido) {
      throw ApiException.noEncontrado('No se encontro el detalle solicitado');
    }

    const producto = await this.obtenerProductoPorIdValidado(detalle.id_producto);
    const subtotalPedidoActual = this.redondearMonto(
      Number(pedido.subtotal_orden_pedido),
    );
    const descuentoPedidoActual = this.redondearMonto(
      Number(pedido.descuento_orden_pedido),
    );
    const subtotalPedidoNuevo = this.redondearMonto(
      subtotalPedidoActual -
        this.redondearMonto(Number(detalle.subtotal_detalle_orden)),
    );

    this.validarDescuentoPedido(descuentoPedidoActual, subtotalPedidoNuevo);

    await this.detallePedidosRepository.eliminarFisico(idDetalle);

    try {
      await this.pedidosCatalogosRepository.actualizarStockProducto(
        producto.id_producto,
        Number(producto.stock_producto) + detalle.cantidad_detalle_orden,
      );
      await this.actualizarResumenPedido(
        idPedido,
        subtotalPedidoNuevo,
        descuentoPedidoActual,
      );
    } catch (error) {
      try {
        await this.detallePedidosRepository.crear({
          id_detalle_orden: detalle.id_detalle_orden,
          id_orden_pedido: detalle.id_orden_pedido,
          id_producto: detalle.id_producto,
          cantidad_detalle_orden: detalle.cantidad_detalle_orden,
          precio_unitario_detalle_orden: this.redondearMonto(
            Number(detalle.precio_unitario_detalle_orden),
          ),
          subtotal_detalle_orden: this.redondearMonto(
            Number(detalle.subtotal_detalle_orden),
          ),
        });
        await this.pedidosCatalogosRepository.actualizarStockProducto(
          producto.id_producto,
          Number(producto.stock_producto),
        );
      } catch {}

      throw error;
    }

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_detalle_orden: idDetalle },
    };
  }

  private async obtenerPedidoGestionable(idPedido: string) {
    const pedido = await this.pedidosRepository.obtenerPorId(idPedido);

    if (!pedido.es_activo_orden_pedido || pedido.deleted_at) {
      throw ApiException.solicitudInvalida(
        'No puedes gestionar detalles en un pedido archivado',
        crearErrorCampo(
          'id_orden_pedido',
          'Reactiva el pedido antes de gestionar sus detalles',
        ),
      );
    }

    if (pedido.estado_orden_pedido !== 'PENDIENTE') {
      throw ApiException.solicitudInvalida(
        'Solo puedes gestionar detalles mientras el pedido este pendiente',
        crearErrorCampo(
          'estado_orden_pedido',
          'Solo puedes agregar, editar o eliminar detalles en pedidos pendientes',
        ),
      );
    }

    return pedido;
  }

  private async obtenerProductoActivoValidado(idProducto: string) {
    const producto =
      await this.pedidosCatalogosRepository.buscarProductoActivoPorId(
        idProducto,
      );

    if (!producto) {
      throw ApiException.solicitudInvalida(
        'El producto seleccionado no existe o no esta activo',
        crearErrorCampo(
          'id_producto',
          'Debes seleccionar un producto activo para el detalle',
        ),
      );
    }

    return producto;
  }

  private async obtenerProductoPorIdValidado(idProducto: string) {
    const producto = await this.pedidosCatalogosRepository.buscarProductoPorId(
      idProducto,
    );

    if (!producto) {
      throw ApiException.solicitudInvalida(
        'No se encontro el producto vinculado al detalle',
        crearErrorCampo(
          'id_producto',
          'No se encontro el producto vinculado al detalle',
        ),
      );
    }

    return producto;
  }

  private async validarProductoNoDuplicado(
    idPedido: string,
    idProducto: string,
    idDetalleActual?: string,
  ) {
    const existeProducto =
      await this.detallePedidosRepository.existeProductoEnPedido(
        idPedido,
        idProducto,
        idDetalleActual,
      );

    if (existeProducto) {
      throw ApiException.conflicto(
        'El producto ya esta registrado en el pedido',
        crearErrorCampo(
          'id_producto',
          'Ese producto ya forma parte del detalle del pedido',
        ),
      );
    }
  }

  private validarStockDisponible(stockDisponible: number, cantidad: number) {
    if (stockDisponible < cantidad) {
      throw ApiException.solicitudInvalida(
        'No hay stock suficiente para registrar esa cantidad',
        crearErrorCampo(
          'cantidad_detalle_orden',
          'La cantidad solicitada supera el stock disponible del producto',
        ),
      );
    }
  }

  private async actualizarResumenPedido(
    idPedido: string,
    subtotalPedido: number,
    descuentoPedido: number,
  ) {
    await this.pedidosRepository.actualizar(idPedido, {
      subtotal_orden_pedido: subtotalPedido,
      descuento_orden_pedido: descuentoPedido,
      total_orden_pedido: this.calcularTotalPedido(
        subtotalPedido,
        descuentoPedido,
      ),
      updated_at: new Date().toISOString(),
    });
  }

  private calcularSubtotalDetalle(cantidad: number, precioUnitario: number) {
    return this.redondearMonto(cantidad * precioUnitario);
  }

  private calcularTotalPedido(subtotal: number, descuento: number) {
    return this.redondearMonto(subtotal - descuento);
  }

  private redondearMonto(valor: number) {
    return Number(Number(valor).toFixed(2));
  }

  private validarDescuentoPedido(descuento: number, subtotal: number) {
    if (descuento > subtotal) {
      throw ApiException.solicitudInvalida(
        'El descuento actual del pedido es mayor al subtotal resultante',
        crearErrorCampo(
          'descuento_orden_pedido',
          'Reduce el descuento del pedido antes de continuar con esta operacion',
        ),
      );
    }
  }
}
