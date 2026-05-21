import { solicitarApi } from '@/src/lib/api/cliente-api';
import { IniciarSesionPayload, SesionActiva } from '@/src/types/auth.types';

export function iniciarSesion(datos: IniciarSesionPayload) {
  return solicitarApi<SesionActiva, IniciarSesionPayload>(
    '/auth/iniciar-sesion',
    {
      metodo: 'POST',
      cuerpo: datos,
    },
  );
}

export function cerrarSesion() {
  return solicitarApi<{ sesion_cerrada: boolean }>('/auth/cerrar-sesion', {
    metodo: 'POST',
  });
}

export function obtenerPerfil() {
  return solicitarApi<SesionActiva>('/auth/perfil');
}
