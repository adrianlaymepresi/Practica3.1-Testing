import { RolSistema } from '../../../common/constants/roles.constant';

export interface UsuarioAutenticacion {
  id_usuario: string;
  id_rol: string;
  nombre_usuario: string;
  contrasenia_usuario: string | null;
  ultima_sesion_usuario: string | null;
  es_activo_usuario: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at: string | null;
  empleado?: {
    id_empleado: string;
    ci_empleado: string;
    nombres_completo_empleado: string;
    apellidos_completo_empleado: string;
    correo_electronico_empleado: string | null;
    telefono_empleado: string | null;
    es_activo_empleado: boolean;
    deleted_at: string | null;
  } | null;
  rol?: {
    id_rol: string;
    nombre_rol: RolSistema | string;
    descripcion_rol: string | null;
    es_activo_rol: boolean;
  } | null;
}

export interface SesionActiva {
  id_usuario: string;
  nombre_usuario: string;
  nombre_completo: string;
  ci_empleado: string;
  rol: RolSistema;
  ultima_sesion_usuario: string | null;
  telefono_empleado: string | null;
  correo_electronico_empleado: string | null;
}
