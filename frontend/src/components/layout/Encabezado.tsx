'use client';

import { usePathname } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { obtenerEtiquetaRuta } from '@/src/lib/constants/rutas';
import { formatearFechaCabecera } from '@/src/lib/utils/fechas';

export function Encabezado() {
  const pathname = usePathname();
  const fechaActual = formatearFechaCabecera();
  const titulo = obtenerEtiquetaRuta(pathname);
  const nombreApp =
    process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';

  return (
    <header className="encabezado">
      <div>
        <span className="encabezado__eyebrow">{nombreApp}</span>
        <h1>{titulo}</h1>
      </div>
      <div className="encabezado__resumen">
        <CalendarDays size={18} aria-hidden="true" />
        <span>{fechaActual}</span>
      </div>
    </header>
  );
}
