'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { obtenerEtiquetaRuta } from '@/src/lib/constants/rutas';
import { formatearFechaCabecera } from '@/src/lib/utils/fechas';
import { cerrarSesion } from '@/src/services/auth.service';
import { SesionActiva } from '@/src/types/auth.types';

interface EncabezadoProps {
  sesion: SesionActiva;
}

export function Encabezado({ sesion }: EncabezadoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const fechaActual = formatearFechaCabecera();
  const titulo = obtenerEtiquetaRuta(pathname);
  const nombreApp =
    process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  async function manejarCierreSesion() {
    setCerrandoSesion(true);

    try {
      await cerrarSesion();
      router.replace('/login');
      router.refresh();
    } finally {
      setCerrandoSesion(false);
    }
  }

  return (
    <header className="encabezado">
      <div>
        <span className="encabezado__eyebrow">{nombreApp}</span>
        <h1>{titulo}</h1>
      </div>
      <div className="encabezado__acciones">
        <div className="encabezado__resumen">
          <CalendarDays size={18} aria-hidden="true" />
          <span>{fechaActual}</span>
        </div>
        <div className="encabezado__usuario">
          <strong>{sesion.nombre_completo || sesion.nombre_usuario}</strong>
          <span>
            {sesion.rol} | {sesion.nombre_usuario}
          </span>
        </div>
        <Boton
          variante="fantasma"
          type="button"
          onClick={() => void manejarCierreSesion()}
          cargando={cerrandoSesion}
        >
          Cerrar sesion
        </Boton>
      </div>
    </header>
  );
}
