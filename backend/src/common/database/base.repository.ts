import type { PostgrestError } from '@supabase/supabase-js';
import { PaginacionQueryDto } from '../dto/paginacion-query.dto';
import { ApiException } from '../exceptions/api.exception';
import { RespuestaPaginada } from '../interfaces/respuesta-paginada.interface';
import {
  crearMetadatosPaginacion,
  normalizarPaginacion,
} from '../utils/paginacion.util';
import { SupabaseService } from './supabase.service';

interface ResultadoSupabase<TDatos> {
  data: TDatos | null;
  error: PostgrestError | null;
}

interface ConsultaSupabase<TEntidad> extends PromiseLike<
  ResultadoSupabase<TEntidad[]>
> {
  select(
    columnas?: string,
    opciones?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean },
  ): ConsultaSupabase<TEntidad>;
  is(campo: string, valor: null): ConsultaSupabase<TEntidad>;
  eq(
    campo: string,
    valor: string | number | boolean | null,
  ): ConsultaSupabase<TEntidad>;
  neq(
    campo: string,
    valor: string | number | boolean,
  ): ConsultaSupabase<TEntidad>;
  ilike(campo: string, patron: string): ConsultaSupabase<TEntidad>;
  order(
    campo: string,
    opciones: { ascending: boolean },
  ): ConsultaSupabase<TEntidad>;
  range(desde: number, hasta: number): ConsultaSupabase<TEntidad>;
  insert(datos: object): ConsultaSupabase<TEntidad>;
  update(datos: object): ConsultaSupabase<TEntidad>;
  delete(): ConsultaSupabase<TEntidad>;
  single(): Promise<ResultadoSupabase<TEntidad>>;
  maybeSingle(): Promise<ResultadoSupabase<TEntidad | null>>;
}

export interface OpcionesListado {
  columnas?: string;
  ordenPor?: string;
  ascendente?: boolean;
  filtros?: Record<string, string | number | boolean | null>;
  campoEliminado?: string;
  incluirEliminados?: boolean;
}

export interface OpcionesPaginadas extends OpcionesListado {
  paginacion?: PaginacionQueryDto;
  campoActivo?: string;
  busqueda?: {
    campo: string;
    valor: string;
    exacta?: boolean;
  };
}

export abstract class BaseRepository<
  TEntidad extends object,
  TCrear extends object,
  TActualizar extends object,
> {
  protected constructor(
    protected readonly supabaseService: SupabaseService,
    protected readonly nombreTabla: string,
    protected readonly campoId: keyof TEntidad & string,
  ) {}

  protected tabla(): ConsultaSupabase<TEntidad> {
    return this.supabaseService.cliente.from(
      this.nombreTabla,
    ) as unknown as ConsultaSupabase<TEntidad>;
  }

  async listarPaginado(
    opciones: OpcionesPaginadas = {},
  ): Promise<RespuestaPaginada<TEntidad>> {
    const { pagina, limite, desde, hasta } = normalizarPaginacion(
      opciones.paginacion ?? {},
    );
    let consulta = this.tabla().select(opciones.columnas ?? '*', {
      count: 'exact',
    });

    if (opciones.campoEliminado && !opciones.incluirEliminados) {
      const estadoRegistro =
        opciones.paginacion?.estadoRegistro ??
        (opciones.paginacion?.soloActivos === false ? 'todos' : 'activos');

      if (estadoRegistro === 'activos') {
        consulta = consulta.is(opciones.campoEliminado, null);
      }
    }

    if (opciones.campoActivo) {
      const estadoRegistro =
        opciones.paginacion?.estadoRegistro ??
        (opciones.paginacion?.soloActivos === false ? 'todos' : 'activos');

      if (estadoRegistro === 'activos') {
        consulta = consulta.eq(opciones.campoActivo, true);
      }

      if (estadoRegistro === 'archivados') {
        consulta = consulta.eq(opciones.campoActivo, false);
      }
    }

    Object.entries(opciones.filtros ?? {}).forEach(([campo, valor]) => {
      consulta =
        valor === null ? consulta.is(campo, null) : consulta.eq(campo, valor);
    });

    if (opciones.busqueda?.valor) {
      consulta = opciones.busqueda.exacta
        ? consulta.eq(opciones.busqueda.campo, opciones.busqueda.valor)
        : consulta.ilike(
            opciones.busqueda.campo,
            `%${opciones.busqueda.valor}%`,
          );
    }

    if (opciones.ordenPor) {
      consulta = consulta.order(opciones.ordenPor, {
        ascending: opciones.ascendente ?? true,
      });
    }

    const { data, error, count } = (await consulta.range(desde, hasta)) as {
      data: TEntidad[] | null;
      error: PostgrestError | null;
      count: number | null;
    };

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return {
      registros: data ?? [],
      paginacion: crearMetadatosPaginacion(pagina, limite, count ?? 0),
    };
  }

  async obtenerPorId(id: string | number): Promise<TEntidad> {
    const { data, error } = await this.tabla()
      .select('*')
      .eq(this.campoId, id)
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as TEntidad;
  }

  async crear(datos: TCrear): Promise<TEntidad> {
    const { data, error } = await this.tabla().insert(datos).select().single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as TEntidad;
  }

  async actualizar(id: string | number, datos: TActualizar): Promise<TEntidad> {
    const { data, error } = await this.tabla()
      .update(datos)
      .eq(this.campoId, id)
      .select()
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data as TEntidad;
  }

  async eliminarFisico(id: string | number): Promise<void> {
    const { error } = await this.tabla().delete().eq(this.campoId, id);

    if (error) {
      throw ApiException.desdeSupabase(error);
    }
  }

  async existePorCampo(
    campo: string,
    valor: string | number,
    excluir?: { campo: string; valor: string | number },
  ): Promise<boolean> {
    let consulta = this.tabla().select(this.campoId).eq(campo, valor);

    if (excluir) {
      consulta = consulta.neq(excluir.campo, excluir.valor);
    }

    const { data, error } = await consulta.range(0, 0);

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return (data ?? []).length > 0;
  }
}
