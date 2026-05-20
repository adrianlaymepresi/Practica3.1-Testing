'use client';

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface InputTextoBaseProps {
  etiqueta: string;
  ayuda?: string;
  requerido?: boolean;
  multilinea?: boolean;
}

type InputTextoProps = InputTextoBaseProps &
  InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export function InputTexto({
  etiqueta,
  ayuda,
  requerido,
  id,
  className = '',
  multilinea = false,
  ...props
}: InputTextoProps) {
  const inputId = id ?? props.name;
  const esRequerido = requerido ?? Boolean(props.required);

  return (
    <label className={`campo ${className}`} htmlFor={inputId}>
      <span className="campo__etiqueta">
        {etiqueta}
        <small>{esRequerido ? 'Obligatorio' : 'Opcional'}</small>
      </span>
      {multilinea ? (
        <textarea
          id={inputId}
          className="campo__control campo__control--textarea"
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className="campo__control"
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {ayuda ? <span className="campo__ayuda">{ayuda}</span> : null}
    </label>
  );
}
