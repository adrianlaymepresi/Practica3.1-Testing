export interface Usuario {
  id_usuario: string;
  id_empleado: string;
  id_rol: string;
  nombre_usuario: string;
  ultima_sesion_usuario: string | null;
  es_activo_usuario: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  empleado?: {
    id_empleado?: string;
    ci_empleado: string;
    nombres_completo_empleado: string;
    apellidos_completo_empleado: string;
    correo_electronico_empleado?: string;
  } | null;
  rol?: {
    id_rol?: string;
    nombre_rol: string;
    descripcion_rol: string | null;
  } | null;
}

export interface CrearUsuarioPayload {
  id_empleado: string;
  id_rol: string;
}

export interface ActualizarUsuarioPayload {
  id_empleado?: string;
  id_rol?: string;
  contrasenia_usuario?: string;
}
