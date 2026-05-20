'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  icono?: ReactNode;
  cargando?: boolean;
}

export function Boton({
  variante = 'primario',
  icono,
  cargando = false,
  children,
  className = '',
  disabled,
  ...props
}: BotonProps) {
  return (
    <button
      className={`boton boton--${variante} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? <Loader2 className="boton__icono girar" /> : icono}
      <span>{children}</span>
    </button>
  );
}
