'use client';

import { useState } from 'react';
import { obtenerErroresCampo, obtenerMensajeError } from '@/src/lib/utils/errores';
import { ErrorCampo } from '@/src/types/api.types';

export function useErroresFormulario() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errores, setErrores] = useState<ErrorCampo[]>([]);

  function mostrar(error: unknown, mensajeDefecto: string) {
    setMensaje(obtenerMensajeError(error, mensajeDefecto));
    setErrores(obtenerErroresCampo(error));
    setAbierto(true);
  }

  function limpiar() {
    setAbierto(false);
    setMensaje(null);
    setErrores([]);
  }

  return {
    abierto,
    mensaje,
    errores,
    mostrar,
    limpiar,
  };
}
