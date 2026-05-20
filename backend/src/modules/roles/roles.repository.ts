import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ActualizarRol, CrearRol, Rol } from './interfaces/rol.interface';

@Injectable()
export class RolesRepository extends BaseRepository<
  Rol,
  CrearRol,
  ActualizarRol
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'rol', 'id_rol');
  }

  listarRoles(paginacion: PaginacionQueryDto) {
    const camposBusqueda: Record<string, string> = {
      nombre_rol: 'nombre_rol',
      descripcion_rol: 'descripcion_rol',
    };
    const campoBusqueda =
      camposBusqueda[paginacion.campoBusqueda ?? 'nombre_rol'] ?? 'nombre_rol';

    return this.listarPaginado({
      paginacion,
      busqueda: paginacion.busqueda
        ? { campo: campoBusqueda, valor: paginacion.busqueda }
        : undefined,
      campoActivo: 'es_activo_rol',
      campoEliminado: 'deleted_at',
      ordenPor: 'created_at',
      ascendente: false,
    });
  }

  async buscarPorNombre(nombreRol: string): Promise<Rol | null> {
    const { data, error } = await this.tabla()
      .select('*')
      .ilike('nombre_rol', nombreRol)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data;
  }

  async listarOpcionesActivas() {
    const { data, error } = await this.tabla()
      .select('id_rol, nombre_rol, descripcion_rol')
      .eq('es_activo_rol', true)
      .is('deleted_at', null)
      .order('nombre_rol', { ascending: true });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data ?? [];
  }
}
