import { solicitarApi } from '@/src/lib/api/cliente-api';
import {
  ParametrosPaginacion,
  RespuestaPaginada,
} from '@/src/types/api.types';
import {
  ActualizarRolPayload,
  CrearRolPayload,
  Rol,
  RolOpcion,
} from '@/src/types/roles.types';

export function listarRoles(parametros: ParametrosPaginacion) {
  return solicitarApi<RespuestaPaginada<Rol>>('/roles', {
    parametros,
  });
}

export function listarRolesOpciones() {
  return solicitarApi<RolOpcion[]>('/roles/opciones');
}

export function crearRol(datos: CrearRolPayload) {
  return solicitarApi<Rol, CrearRolPayload>('/roles', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function actualizarRol(idRol: string, datos: ActualizarRolPayload) {
  return solicitarApi<Rol, ActualizarRolPayload>(`/roles/${idRol}`, {
    metodo: 'PATCH',
    cuerpo: datos,
  });
}

export function archivarRol(idRol: string) {
  return solicitarApi<Rol>(`/roles/${idRol}/archivar`, {
    metodo: 'PATCH',
  });
}

export function reactivarRol(idRol: string) {
  return solicitarApi<Rol>(`/roles/${idRol}/reactivar`, {
    metodo: 'PATCH',
  });
}

export function eliminarRol(idRol: string) {
  return solicitarApi<{ id_rol: string }>(`/roles/${idRol}`, {
    metodo: 'DELETE',
  });
}
