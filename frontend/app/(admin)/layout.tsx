import type { ReactNode } from 'react';
import { Encabezado } from '@/src/components/layout/Encabezado';
import { Sidebar } from '@/src/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="admin">
      <Sidebar />
      <div className="admin__contenido">
        <Encabezado />
        <main className="admin__main">{children}</main>
      </div>
    </div>
  );
}
