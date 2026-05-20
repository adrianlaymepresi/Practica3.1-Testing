'use client';

import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputContraseniaProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  etiqueta: string;
  ayuda?: string;
  requerido?: boolean;
}

export function InputContrasenia({
  etiqueta,
  ayuda,
  requerido,
  id,
  className = '',
  ...props
}: InputContraseniaProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name;
  const esRequerido = requerido ?? Boolean(props.required);

  return (
    <label className={`campo ${className}`} htmlFor={inputId}>
      <span className="campo__etiqueta">
        {etiqueta}
        <small>{esRequerido ? 'Obligatorio' : 'Opcional'}</small>
      </span>
      <span className="campo-contrasenia">
        <input
          id={inputId}
          className="campo__control"
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <button
          className="campo-contrasenia__toggle"
          type="button"
          onClick={() => setVisible((actual) => !actual)}
          aria-label={visible ? 'Ocultar contrasenia' : 'Mostrar contrasenia'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {ayuda ? <span className="campo__ayuda">{ayuda}</span> : null}
    </label>
  );
}
