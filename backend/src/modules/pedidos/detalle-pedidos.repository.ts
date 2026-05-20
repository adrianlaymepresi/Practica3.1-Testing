import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { paginarColeccion } from '../../common/utils/paginacion.util';
import {
  ActualizarDetallePedido,
  CrearDetallePedido,
  DetallePedidoRegistro,
} from './interfaces/detalle-pedido.interface';

interface DetallePedidoRegistroCrudo
  extends Omit<DetallePedidoRegistro, 'producto'> {
  producto?: DetallePedidoRegistro['producto'] | DetallePedidoRegistro['producto'][];
}

@Injectable()
export class DetallePedidosRepository extends BaseRepository<
  DetallePedidoRegistro,
  CrearDetallePedido,
  ActualizarDetallePedido
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'detalleorden', 'id_detalle_orden');
  }

  async listarDetallesPedido(
    idPedido: string,
    paginacion: PaginacionQueryDto,
  ) {
    const { data, error } = await this.supabaseService.cliente
      .from('detalleorden')
      .select(
        'id_detalle_orden, id_orden_pedido, id_producto, cantidad_detalle_orden, precio_unitario_detalle_orden, subtotal_detalle_orden, created_at, updated_at, producto(id_producto, codigo_producto, nombre_producto, precio_producto, stock_producto, url_imagen_producto, es_activo_producto)',
      )
      .eq('id_orden_pedido', idPedido)
      .order('created_at', { ascending: false });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    const termino = paginacion.busqueda?.trim().toUpperCase() ?? '';
    const campoBusqueda = paginacion.campoBusqueda ?? 'nombre_producto';

    const detalles = ((data ?? []) as DetallePedidoRegistroCrudo[])
      .map((detalle) => this.normalizarDetalle(detalle))
      .filter((detalle) =>
        this.coincideBusqueda(detalle, campoBusqueda, termino),
      );

    return paginarColeccion(detalles, paginacion);
  }

  async obtenerDetalleConRelacionesPorId(idDetalle: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('detalleorden')
      .select(
        'id_detalle_orden, id_orden_pedido, id_producto, cantidad_detalle_orden, precio_unitario_detalle_orden, subtotal_detalle_orden, created_at, updated_at, producto(id_producto, codigo_producto, nombre_producto, precio_producto, stock_producto, url_imagen_producto, es_activo_producto)',
      )
      .eq('id_detalle_orden', idDetalle)
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return this.normalizarDetalle(data as DetallePedidoRegistroCrudo);
  }

  async existeProductoEnPedido(
    idPedido: string,
    idProducto: string,
    idDetalleActual?: string,
  ) {
    let consulta = this.tabla()
      .select('id_detalle_orden')
      .eq('id_orden_pedido', idPedido)
      .eq('id_producto', idProducto);

    if (idDetalleActual) {
      consulta = consulta.neq('id_detalle_orden', idDetalleActual);
    }

    const { data, error } = await consulta.range(0, 0);

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return (data ?? []).length > 0;
  }

  private coincideBusqueda(
    detalle: DetallePedidoRegistro,
    campoBusqueda: string,
    termino: string,
  ) {
    if (!termino) {
      return true;
    }

    const valoresPorCampo: Record<string, string> = {
      codigo_producto: detalle.producto?.codigo_producto?.toUpperCase() ?? '',
      nombre_producto: detalle.producto?.nombre_producto?.toUpperCase() ?? '',
    };

    return (valoresPorCampo[campoBusqueda] ?? '').includes(termino);
  }

  private normalizarDetalle(
    detalle: DetallePedidoRegistroCrudo,
  ): DetallePedidoRegistro {
    return {
      ...detalle,
      producto: Array.isArray(detalle.producto)
        ? (detalle.producto[0] ?? null)
        : (detalle.producto ?? null),
    };
  }
}
