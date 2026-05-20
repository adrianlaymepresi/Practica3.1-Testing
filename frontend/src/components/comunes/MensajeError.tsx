interface MensajeErrorProps {
  mensaje: string;
}

export function MensajeError({ mensaje }: MensajeErrorProps) {
  return <p className="mensaje-error">{mensaje}</p>;
}
