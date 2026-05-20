import {
  BriefcaseBusiness,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  UserRoundCog,
  Users,
  UserSquare2,
} from 'lucide-react';

export const rutasAdministracion = [
  {
    href: '/dashboard',
    etiqueta: 'Dashboard',
    icono: LayoutDashboard,
  },
  {
    href: '/roles',
    etiqueta: 'Roles',
    icono: ShieldCheck,
  },
  {
    href: '/empleados',
    etiqueta: 'Empleados',
    icono: UserSquare2,
  },
  {
    href: '/usuarios',
    etiqueta: 'Usuarios',
    icono: UserRoundCog,
  },
  {
    href: '/clientes',
    etiqueta: 'Clientes',
    icono: Users,
  },
  {
    href: '/productos',
    etiqueta: 'Productos',
    icono: Package,
  },
  {
    href: '/pedidos',
    etiqueta: 'Pedidos',
    icono: ReceiptText,
  },
] as const;

export function obtenerEtiquetaRuta(pathname: string) {
  return (
    rutasAdministracion.find(
      (ruta) => pathname === ruta.href || pathname.startsWith(`${ruta.href}/`),
    )?.etiqueta ?? 'Panel administrativo'
  );
}

export const accesoRapidoDashboard = [
  {
    titulo: 'Roles',
    descripcion: 'Modulo disponible para crear, editar, archivar y eliminar.',
    href: '/roles',
    icono: ShieldCheck,
    estado: 'Disponible ahora',
  },
  {
    titulo: 'Empleados',
    descripcion: 'Preparado para continuar con el siguiente dominio.',
    href: '/empleados',
    icono: UserSquare2,
    estado: 'Siguiente fase',
  },
  {
    titulo: 'Usuarios',
    descripcion: 'Listo para integrarse sobre empleados y roles.',
    href: '/usuarios',
    icono: UserRoundCog,
    estado: 'Pendiente',
  },
  {
    titulo: 'Clientes',
    descripcion: 'Quedara alineado con pedidos y ordenes posteriores.',
    href: '/clientes',
    icono: Users,
    estado: 'Pendiente',
  },
  {
    titulo: 'Productos',
    descripcion: 'Se mostraran como cards con soporte de imagen.',
    href: '/productos',
    icono: Package,
    estado: 'Pendiente',
  },
  {
    titulo: 'Pedidos',
    descripcion: 'Gestionara ordenpedido y detalleorden con calculos en backend.',
    href: '/pedidos',
    icono: BriefcaseBusiness,
    estado: 'Pendiente',
  },
] as const;
