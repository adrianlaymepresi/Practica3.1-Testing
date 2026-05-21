import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { UsuarioAutenticacion } from './interfaces/sesion-activa.interface';

const COLUMNAS_USUARIO_SESION = `
  id_usuario,
  id_rol,
  nombre_usuario,
  contrasenia_usuario,
  ultima_sesion_usuario,
  es_activo_usuario,
  deleted_at,
  empleado(
    id_empleado,
    ci_empleado,
    nombres_completo_empleado,
    apellidos_completo_empleado,
    correo_electronico_empleado,
    telefono_empleado,
    es_activo_empleado,
    deleted_at
  ),
  rol(
    id_rol,
    nombre_rol,
    descripcion_rol,
    es_activo_rol
  )
`;

interface UsuarioAutenticacionCrudo extends Omit<
  UsuarioAutenticacion,
  'empleado' | 'rol'
> {
  empleado?:
    | UsuarioAutenticacion['empleado']
    | UsuarioAutenticacion['empleado'][];
  rol?: UsuarioAutenticacion['rol'] | UsuarioAutenticacion['rol'][];
}

@Injectable()
export class AuthRepository extends BaseRepository<
  UsuarioAutenticacion,
  never,
  Record<string, unknown>
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'usuario', 'id_usuario');
  }

  async buscarPorNombreUsuario(nombreUsuario: string) {
    const { data, error } = await this.tabla()
      .select(COLUMNAS_USUARIO_SESION)
      .ilike('nombre_usuario', nombreUsuario)
      .maybeSingle();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return data ? this.normalizarUsuario(data) : null;
  }

  async obtenerParaSesion(idUsuario: string) {
    const { data, error } = await this.tabla()
      .select(COLUMNAS_USUARIO_SESION)
      .eq('id_usuario', idUsuario)
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return this.normalizarUsuario(data as UsuarioAutenticacionCrudo);
  }

  async actualizarDatosSesion(
    idUsuario: string,
    datos: Record<string, unknown>,
  ) {
    const { error } = await this.tabla().update(datos).eq('id_usuario', idUsuario);

    if (error) {
      throw ApiException.desdeSupabase(error);
    }
  }

  private normalizarUsuario(
    usuario: UsuarioAutenticacionCrudo,
  ): UsuarioAutenticacion {
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
