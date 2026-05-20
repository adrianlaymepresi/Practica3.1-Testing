import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import {
  ActualizarProducto,
  CrearProducto,
  Producto,
} from './interfaces/producto.interface';

@Injectable()
export class ProductosRepository extends BaseRepository<
  Producto,
  CrearProducto,
  ActualizarProducto
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'producto', 'id_producto');
  }

  listarProductos(paginacion: PaginacionQueryDto) {
    const camposBusqueda: Record<string, string> = {
      codigo_producto: 'codigo_producto',
      nombre_producto: 'nombre_producto',
      descripcion_producto: 'descripcion_producto',
    };
    const campoBusqueda =
      camposBusqueda[paginacion.campoBusqueda ?? 'nombre_producto'] ??
      'nombre_producto';

    return this.listarPaginado({
      paginacion,
      busqueda: paginacion.busqueda
        ? { campo: campoBusqueda, valor: paginacion.busqueda }
        : undefined,
      campoActivo: 'es_activo_producto',
      campoEliminado: 'deleted_at',
      ordenPor: 'created_at',
      ascendente: false,
    });
  }

  async buscarPorCodigo(codigoProducto: string): Promise<Producto | null> {
    const { data, error } = await this.tabla()
      .select('*')
      .ilike('codigo_producto', codigoProducto)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data;
  }

  async buscarPorNombre(nombreProducto: string): Promise<Producto | null> {
    const { data, error } = await this.tabla()
      .select('*')
      .ilike('nombre_producto', nombreProducto)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data;
  }
}
