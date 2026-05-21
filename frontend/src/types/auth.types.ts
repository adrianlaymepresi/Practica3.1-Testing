export type RolSistema = 'ADMINISTRADOR' | 'AYUDANTE';

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

export interface IniciarSesionPayload {
  nombre_usuario: string;
  contrasenia: string;
}
