import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { paginarColeccion } from '../../common/utils/paginacion.util';
import {
  ActualizarUsuario,
  CrearUsuario,
  UsuarioRegistro,
} from './interfaces/usuario.interface';

interface UsuarioRegistroCrudo extends Omit<
  UsuarioRegistro,
  'empleado' | 'rol'
> {
  empleado?: UsuarioRegistro['empleado'] | UsuarioRegistro['empleado'][];
  rol?: UsuarioRegistro['rol'] | UsuarioRegistro['rol'][];
}

@Injectable()
export class UsuariosRepository extends BaseRepository<
  UsuarioRegistro,
  CrearUsuario,
  ActualizarUsuario
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'usuario', 'id_usuario');
  }

  async listarUsuarios(paginacion: PaginacionQueryDto) {
    const { data, error } = await this.supabaseService.cliente
      .from('usuario')
      .select(
        'id_usuario, id_empleado, id_rol, nombre_usuario, contrasenia_usuario, ultima_sesion_usuario, es_activo_usuario, created_at, updated_at, deleted_at, empleado(id_empleado, ci_empleado, nombres_completo_empleado, apellidos_completo_empleado, correo_electronico_empleado), rol(id_rol, nombre_rol, descripcion_rol)',
      )
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    const termino = paginacion.busqueda?.trim().toUpperCase() ?? '';
    const campoBusqueda = paginacion.campoBusqueda ?? 'nombre_usuario';
    const estadoRegistro =
      paginacion.estadoRegistro ??
      (paginacion.soloActivos === false ? 'todos' : 'activos');

    const usuarios = ((data ?? []) as UsuarioRegistroCrudo[])
      .map((usuario) => this.normalizarUsuario(usuario))
      .filter((usuario) => {
        if (estadoRegistro === 'activos') {
          return usuario.es_activo_usuario && !usuario.deleted_at;
        }

        if (estadoRegistro === 'archivados') {
          return !usuario.es_activo_usuario || Boolean(usuario.deleted_at);
        }

        return true;
      })
      .filter((usuario) =>
        this.coincideBusqueda(usuario, campoBusqueda, termino),
      );

    return paginarColeccion(usuarios, paginacion);
  }

  existeNombreUsuario(nombreUsuario: string, idUsuarioActual?: string) {
    return this.existePorCampo(
      'nombre_usuario',
      nombreUsuario,
      idUsuarioActual
        ? { campo: 'id_usuario', valor: idUsuarioActual }
        : undefined,
    );
  }

  async obtenerUsuarioConRelacionesPorId(idUsuario: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('usuario')
      .select(
        'id_usuario, id_empleado, id_rol, nombre_usuario, contrasenia_usuario, ultima_sesion_usuario, es_activo_usuario, created_at, updated_at, deleted_at, empleado(id_empleado, ci_empleado, nombres_completo_empleado, apellidos_completo_empleado, correo_electronico_empleado), rol(id_rol, nombre_rol, descripcion_rol)',
      )
      .eq('id_usuario', idUsuario)
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return this.normalizarUsuario(data as UsuarioRegistroCrudo);
  }

  private coincideBusqueda(
    usuario: UsuarioRegistro,
    campoBusqueda: string,
    termino: string,
  ) {
    if (!termino) {
      return true;
    }

    const nombreEmpleado = [
      usuario.empleado?.nombres_completo_empleado ?? '',
      usuario.empleado?.apellidos_completo_empleado ?? '',
    ]
      .join(' ')
      .trim()
      .toUpperCase();
    const nombreRol = usuario.rol?.nombre_rol?.toUpperCase() ?? '';
    const valoresPorCampo: Record<string, string> = {
      nombre_usuario: usuario.nombre_usuario.toUpperCase(),
      empleado: nombreEmpleado,
      ci_empleado: usuario.empleado?.ci_empleado?.toUpperCase() ?? '',
      nombre_rol: nombreRol,
    };

    return (valoresPorCampo[campoBusqueda] ?? '')
      .toUpperCase()
      .includes(termino);
  }

  private normalizarUsuario(usuario: UsuarioRegistroCrudo): UsuarioRegistro {
    return {
      ...usuario,
      empleado: Array.isArray(usuario.empleado)
        ? (usuario.empleado[0] ?? null)
        : (usuario.empleado ?? null),
      rol: Array.isArray(usuario.rol)
        ? (usuario.rol[0] ?? null)
        : (usuario.rol ?? null),
    };
  }
}
