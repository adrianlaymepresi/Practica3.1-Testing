import { Injectable } from '@nestjs/common';
import { ApiException } from '../../common/exceptions/api.exception';
import { SupabaseService } from '../../common/database/supabase.service';
import { Cliente } from '../clientes/interfaces/cliente.interface';
import { DetallePedidoResumenProducto } from './interfaces/detalle-pedido.interface';
import { Empleado } from '../empleados/interfaces/empleado.interface';
import { Producto } from '../productos/interfaces/producto.interface';

@Injectable()
export class PedidosCatalogosRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async buscarClienteActivoPorId(idCliente: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('cliente')
      .select('*')
      .eq('id_cliente', idCliente)
      .eq('es_activo_cliente', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as Cliente | null;
  }

  async buscarEmpleadoActivoPorId(idEmpleado: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('empleado')
      .select('*')
      .eq('id_empleado', idEmpleado)
      .eq('es_activo_empleado', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as Empleado | null;
  }

  async buscarProductoActivoPorId(idProducto: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('producto')
      .select('*')
      .eq('id_producto', idProducto)
      .eq('es_activo_producto', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as Producto | null;
  }

  async buscarProductoPorId(idProducto: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('producto')
      .select('*')
      .eq('id_producto', idProducto)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as Producto | null;
  }

  async listarProductosDisponiblesParaPedido(
    idPedido: string,
    idDetalleActual?: string,
  ) {
    const [productosRespuesta, detallesRespuesta] = await Promise.all([
      this.supabaseService.cliente
        .from('producto')
        .select(
          'id_producto, codigo_producto, nombre_producto, precio_producto, stock_producto, url_imagen_producto, es_activo_producto',
        )
        .eq('es_activo_producto', true)
        .is('deleted_at', null)
        .order('nombre_producto', { ascending: true }),
      this.supabaseService.cliente
        .from('detalleorden')
        .select('id_detalle_orden, id_producto')
        .eq('id_orden_pedido', idPedido),
    ]);

    if (productosRespuesta.error) {
      throw ApiException.desdeSupabase(productosRespuesta.error);
    }

    if (detallesRespuesta.error) {
      throw ApiException.desdeSupabase(detallesRespuesta.error);
    }

    const detalles = (detallesRespuesta.data ?? []) as Array<{
      id_detalle_orden: string;
      id_producto: string;
    }>;
    const idProductoActual =
      detalles.find((detalle) => detalle.id_detalle_orden === idDetalleActual)
        ?.id_producto ?? null;
    const productosUsados = new Set(
      detalles
        .filter((detalle) => detalle.id_detalle_orden !== idDetalleActual)
        .map((detalle) => detalle.id_producto),
    );

    return ((productosRespuesta.data ?? []) as DetallePedidoResumenProducto[])
      .filter((producto) => {
        if (productosUsados.has(producto.id_producto ?? '')) {
          return false;
        }

        if (producto.id_producto === idProductoActual) {
          return true;
        }

        return Number(producto.stock_producto) > 0;
      })
      .map((producto) => ({
        id_producto: producto.id_producto ?? '',
        codigo_producto: producto.codigo_producto,
        nombre_producto: producto.nombre_producto,
        precio_producto: Number(producto.precio_producto),
        stock_producto: Number(producto.stock_producto),
        url_imagen_producto: producto.url_imagen_producto,
      }));
  }

  async actualizarStockProducto(idProducto: string, stockProducto: number) {
    const { data, error } = await this.supabaseService.cliente
      .from('producto')
      .update({
        stock_producto: stockProducto,
        updated_at: new Date().toISOString(),
      })
      .eq('id_producto', idProducto)
      .select('*')
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as Producto;
  }
}
