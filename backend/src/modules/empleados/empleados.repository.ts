import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import {
  ActualizarEmpleado,
  CrearEmpleado,
  Empleado,
} from './interfaces/empleado.interface';

@Injectable()
export class EmpleadosRepository extends BaseRepository<
  Empleado,
  CrearEmpleado,
  ActualizarEmpleado
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'empleado', 'id_empleado');
  }

  listarEmpleados(paginacion: PaginacionQueryDto) {
    const camposBusqueda: Record<string, string> = {
      ci_empleado: 'ci_empleado',
      nombres_completo_empleado: 'nombres_completo_empleado',
      apellidos_completo_empleado: 'apellidos_completo_empleado',
      correo_electronico_empleado: 'correo_electronico_empleado',
    };
    const campoBusqueda =
      camposBusqueda[paginacion.campoBusqueda ?? 'ci_empleado'] ??
      'ci_empleado';

    return this.listarPaginado({
      paginacion,
      busqueda: paginacion.busqueda
        ? { campo: campoBusqueda, valor: paginacion.busqueda }
        : undefined,
      campoActivo: 'es_activo_empleado',
      campoEliminado: 'deleted_at',
      ordenPor: 'created_at',
      ascendente: false,
    });
  }

  existeCi(ciEmpleado: string, idActual?: string) {
    return this.existePorCampo(
      'ci_empleado',
      ciEmpleado,
      idActual ? { campo: 'id_empleado', valor: idActual } : undefined,
    );
  }

  existeCorreo(correo: string, idActual?: string) {
    return this.existePorCampo(
      'correo_electronico_empleado',
      correo,
      idActual ? { campo: 'id_empleado', valor: idActual } : undefined,
    );
  }

  async listarOpcionesActivas() {
    const { data, error } = await this.tabla()
      .select(
        'id_empleado, ci_empleado, nombres_completo_empleado, apellidos_completo_empleado, correo_electronico_empleado',
      )
      .eq('es_activo_empleado', true)
      .is('deleted_at', null)
      .order('nombres_completo_empleado', { ascending: true });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data ?? [];
  }
}
