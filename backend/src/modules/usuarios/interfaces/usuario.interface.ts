export interface UsuarioResumenEmpleado {
  id_empleado?: string;
  ci_empleado: string;
  nombres_completo_empleado: string;
  apellidos_completo_empleado: string;
  correo_electronico_empleado?: string;
}

export interface UsuarioResumenRol {
  id_rol?: string;
  nombre_rol: string;
  descripcion_rol: string | null;
}

export interface UsuarioRegistro {
  id_usuario: string;
  id_empleado: string;
  id_rol: string;
  nombre_usuario: string;
  contrasenia_usuario: string | null;
  ultima_sesion_usuario: string | null;
  es_activo_usuario: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  empleado?: UsuarioResumenEmpleado | null;
  rol?: UsuarioResumenRol | null;
}

export type CrearUsuario = Pick<
  UsuarioRegistro,
  | 'id_empleado'
  | 'id_rol'
  | 'nombre_usuario'
  | 'contrasenia_usuario'
  | 'es_activo_usuario'
>;

export type ActualizarUsuario = Partial<CrearUsuario> & {
  updated_at: string;
  deleted_at?: string | null;
};
