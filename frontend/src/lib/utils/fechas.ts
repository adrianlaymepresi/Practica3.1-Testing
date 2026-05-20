const ZONA_HORARIA_APLICACION =
  process.env.NEXT_PUBLIC_ZONA_HORARIA ?? 'America/La_Paz';

const REGEX_FECHA_ISO_SIMPLE = /^\d{4}-\d{2}-\d{2}$/;

function construirFechaDesdeIsoSimple(valor: string) {
  const [anio, mes, dia] = valor.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

function obtenerFechaFormateable(valor: string) {
  if (REGEX_FECHA_ISO_SIMPLE.test(valor)) {
    return construirFechaDesdeIsoSimple(valor);
  }

  return new Date(valor);
}

export function formatearFechaSimpleZonaHoraria(
  valor?: string | null,
  locale = 'es-BO',
) {
  if (!valor) {
    return 'Sin dato';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: REGEX_FECHA_ISO_SIMPLE.test(valor)
      ? 'UTC'
      : ZONA_HORARIA_APLICACION,
  }).format(obtenerFechaFormateable(valor));
}

export function formatearFechaHoraZonaHoraria(
  valor?: string | null,
  locale = 'es-BO',
) {
  if (!valor) {
    return 'Sin dato';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: ZONA_HORARIA_APLICACION,
  }).format(obtenerFechaFormateable(valor));
}

export function formatearFechaCabecera() {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA_HORARIA_APLICACION,
  }).format(new Date());
}
