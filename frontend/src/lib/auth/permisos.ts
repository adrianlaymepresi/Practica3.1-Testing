import { rutasAdministracion } from '@/src/lib/constants/rutas';
import { RolSistema } from '@/src/types/auth.types';

export function obtenerRutaInicioPorRol(rol?: RolSistema | null) {
  if (rol === 'ADMINISTRADOR') {
    return '/dashboard';
  }

  return '/clientes';
}

export function puedeAccederRuta(
  rol: RolSistema | string | null | undefined,
  ruta: string,
) {
  if (rol !== 'ADMINISTRADOR' && rol !== 'AYUDANTE') {
    return false;
  }

  if (ruta === '/dashboard' || ruta.startsWith('/dashboard/')) {
    return rol === 'ADMINISTRADOR';
  }

  if (ruta === '/roles' || ruta.startsWith('/roles/')) {
    return rol === 'ADMINISTRADOR';
  }

  if (ruta === '/empleados' || ruta.startsWith('/empleados/')) {
    return rol === 'ADMINISTRADOR';
  }

  if (ruta === '/usuarios' || ruta.startsWith('/usuarios/')) {
    return rol === 'ADMINISTRADOR';
  }

  if (ruta === '/clientes' || ruta.startsWith('/clientes/')) {
    return true;
  }

  if (ruta === '/productos' || ruta.startsWith('/productos/')) {
    return true;
  }

  if (ruta === '/pedidos' || ruta.startsWith('/pedidos/')) {
    return true;
  }

  return false;
}

export function obtenerRutasVisibles(rol?: RolSistema | null) {
  return rutasAdministracion.filter((ruta) => puedeAccederRuta(rol, ruta.href));
}
