import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/src/lib/auth/sesion';
import { PedidosPageClient } from './PedidosPageClient';

export default async function PedidosPage() {
  const sesion = await obtenerSesionServidor();

  if (!sesion) {
    redirect('/login');
  }

  return <PedidosPageClient sesion={sesion} />;
}
