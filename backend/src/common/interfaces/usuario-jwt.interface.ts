import { RolSistema } from '../constants/roles.constant';

export interface UsuarioJwt {
  sub: string;
  id_empleado: string;
  nombre_usuario: string;
  nombre_completo: string;
  ci_empleado: string;
  rol: RolSistema;
  iat?: number;
  exp?: number;
}
