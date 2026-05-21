'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Package2, X } from 'lucide-react';
import { obtenerRutasVisibles } from '@/src/lib/auth/permisos';
import { SesionActiva } from '@/src/types/auth.types';

interface SidebarProps {
  sesion: SesionActiva;
}

export function Sidebar({ sesion }: SidebarProps) {
  const pathname = usePathname();
  const nombreApp =
    process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';
  const rutasVisibles = obtenerRutasVisibles(sesion.rol);

  return (
    <>
      <input
        className="sidebar-control"
        id="sidebar-control"
        type="checkbox"
        defaultChecked
        aria-label="Mostrar u ocultar menu"
      />
      <label className="sidebar-boton-movil" htmlFor="sidebar-control">
        <Menu size={20} aria-hidden="true" />
      </label>
      <aside className="sidebar">
        <div className="sidebar__cabecera">
          <div className="marca">
            <span className="marca__simbolo">
              <Package2 size={20} aria-hidden="true" />
            </span>
            <div>
              <strong>{nombreApp}</strong>
              <span>Sistema de pedidos</span>
            </div>
          </div>
          <label className="sidebar__cerrar" htmlFor="sidebar-control">
            <X size={18} aria-hidden="true" />
          </label>
        </div>

        <nav className="sidebar__nav" aria-label="Menu principal">
          {rutasVisibles.map((ruta) => {
            const Icono = ruta.icono;
            const estaActivo =
              pathname === ruta.href || pathname.startsWith(`${ruta.href}/`);

            return (
              <Link
                className={`sidebar__enlace ${
                  estaActivo ? 'sidebar__enlace--activo' : ''
                }`}
                href={ruta.href}
                key={ruta.href}
              >
                <Icono size={18} aria-hidden="true" />
                <span>{ruta.etiqueta}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <label className="sidebar-fondo" htmlFor="sidebar-control" />
    </>
  );
}
