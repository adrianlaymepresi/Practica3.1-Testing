import { solicitarApi } from '@/src/lib/api/cliente-api';
import {
  ParametrosPaginacion,
  RespuestaPaginada,
} from '@/src/types/api.types';
import {
  ActualizarUsuarioPayload,
  CrearUsuarioPayload,
  Usuario,
} from '@/src/types/usuarios.types';

export function listarUsuarios(parametros: ParametrosPaginacion) {
  return solicitarApi<RespuestaPaginada<Usuario>>('/usuarios', {
    parametros,
  });
}

export function crearUsuario(datos: CrearUsuarioPayload) {
  return solicitarApi<Usuario, CrearUsuarioPayload>('/usuarios', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function actualizarUsuario(
  idUsuario: string,
  datos: ActualizarUsuarioPayload,
) {
  return solicitarApi<Usuario, ActualizarUsuarioPayload>(
    `/usuarios/${idUsuario}`,
    {
      metodo: 'PATCH',
      cuerpo: datos,
    },
  );
}

export function archivarUsuario(idUsuario: string) {
  return solicitarApi<Usuario>(`/usuarios/${idUsuario}/archivar`, {
    metodo: 'PATCH',
  });
}

export function reactivarUsuario(idUsuario: string) {
  return solicitarApi<Usuario>(`/usuarios/${idUsuario}/reactivar`, {
    metodo: 'PATCH',
  });
}

export function eliminarUsuario(idUsuario: string) {
  return solicitarApi<{ id_usuario: string }>(`/usuarios/${idUsuario}`, {
    metodo: 'DELETE',
  });
}
