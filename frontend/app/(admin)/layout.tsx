import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Encabezado } from '@/src/components/layout/Encabezado';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { obtenerSesionServidor } from '@/src/lib/auth/sesion';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sesion = await obtenerSesionServidor();

  if (!sesion) {
    redirect('/login');
  }

  return (
    <div className="admin">
      <Sidebar sesion={sesion} />
      <div className="admin__contenido">
        <Encabezado sesion={sesion} />
        <main className="admin__main">{children}</main>
      </div>
    </div>
  );
}
