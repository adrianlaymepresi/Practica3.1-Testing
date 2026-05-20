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
    descripcion: 'Modulo disponible para gestionar personal y relaciones base.',
    href: '/empleados',
    icono: UserSquare2,
    estado: 'Disponible ahora',
  },
  {
    titulo: 'Usuarios',
    descripcion: 'Modulo disponible con asignacion de empleado, rol y contrasenia cifrada.',
    href: '/usuarios',
    icono: UserRoundCog,
    estado: 'Disponible ahora',
  },
  {
    titulo: 'Clientes',
    descripcion: 'Modulo disponible para gestionar clientes y preparar las ordenes.',
    href: '/clientes',
    icono: Users,
    estado: 'Disponible ahora',
  },
  {
    titulo: 'Productos',
    descripcion: 'Modulo disponible con cards, imagen y soporte de Storage.',
    href: '/productos',
    icono: Package,
    estado: 'Disponible ahora',
  },
  {
    titulo: 'Pedidos',
    descripcion: 'Modulo disponible para pedidos, detalle, calculos y control de stock.',
    href: '/pedidos',
    icono: BriefcaseBusiness,
    estado: 'Disponible ahora',
  },
] as const;
