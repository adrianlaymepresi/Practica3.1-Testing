import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import {
  ActualizarCliente,
  Cliente,
  CrearCliente,
} from './interfaces/cliente.interface';

@Injectable()
export class ClientesRepository extends BaseRepository<
  Cliente,
  CrearCliente,
  ActualizarCliente
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'cliente', 'id_cliente');
  }

  listarClientes(paginacion: PaginacionQueryDto) {
    const camposBusqueda: Record<string, string> = {
      ci_cliente: 'ci_cliente',
      nombres_completo_cliente: 'nombres_completo_cliente',
      apellidos_completo_cliente: 'apellidos_completo_cliente',
      telefono_cliente: 'telefono_cliente',
      correo_electronico_cliente: 'correo_electronico_cliente',
      direccion_cliente: 'direccion_cliente',
    };
    const campoBusqueda =
      camposBusqueda[paginacion.campoBusqueda ?? 'ci_cliente'] ?? 'ci_cliente';

    return this.listarPaginado({
      paginacion,
      busqueda: paginacion.busqueda
        ? { campo: campoBusqueda, valor: paginacion.busqueda }
        : undefined,
      campoActivo: 'es_activo_cliente',
      campoEliminado: 'deleted_at',
      ordenPor: 'created_at',
      ascendente: false,
    });
  }

  existeCi(ciCliente: string, idActual?: string) {
    return this.existePorCampo(
      'ci_cliente',
      ciCliente,
      idActual ? { campo: 'id_cliente', valor: idActual } : undefined,
    );
  }

  async listarOpcionesActivas() {
    const { data, error } = await this.tabla()
      .select(
        'id_cliente, ci_cliente, nombres_completo_cliente, apellidos_completo_cliente, telefono_cliente, correo_electronico_cliente, direccion_cliente',
      )
      .eq('es_activo_cliente', true)
      .is('deleted_at', null)
      .order('nombres_completo_cliente', { ascending: true });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data ?? [];
  }
}
