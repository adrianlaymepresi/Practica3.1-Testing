import { Injectable } from '@nestjs/common';
import { ApiException } from '../../common/exceptions/api.exception';
import { SupabaseService } from '../../common/database/supabase.service';
import { Cliente } from '../clientes/interfaces/cliente.interface';
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
