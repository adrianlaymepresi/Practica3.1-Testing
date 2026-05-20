import { Loader2 } from 'lucide-react';

interface SpinnerCargaProps {
  texto?: string;
}

export function SpinnerCarga({ texto = 'Cargando' }: SpinnerCargaProps) {
  return (
    <div className="spinner-carga" role="status" aria-live="polite">
      <Loader2 className="spinner-carga__icono girar" />
      <span>{texto}</span>
    </div>
  );
}
