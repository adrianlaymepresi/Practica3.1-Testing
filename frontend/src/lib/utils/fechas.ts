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

export function obtenerFechaActualZonaHoraria() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA_APLICACION,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const anio = partes.find((parte) => parte.type === 'year')?.value ?? '2000';
  const mes = partes.find((parte) => parte.type === 'month')?.value ?? '01';
  const dia = partes.find((parte) => parte.type === 'day')?.value ?? '01';

  return `${anio}-${mes}-${dia}`;
}

function obtenerPartesFechaHoraLocal(fecha: Date) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA_APLICACION,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);

  return {
    anio: partes.find((parte) => parte.type === 'year')?.value ?? '2000',
    mes: partes.find((parte) => parte.type === 'month')?.value ?? '01',
    dia: partes.find((parte) => parte.type === 'day')?.value ?? '01',
    hora: partes.find((parte) => parte.type === 'hour')?.value ?? '00',
    minuto: partes.find((parte) => parte.type === 'minute')?.value ?? '00',
  };
}

export function obtenerFechaHoraActualInputLocal() {
  const { anio, mes, dia, hora, minuto } = obtenerPartesFechaHoraLocal(
    new Date(),
  );

  return `${anio}-${mes}-${dia}T${hora}:${minuto}`;
}

export function formatearFechaHoraInputLocal(valor?: string | null) {
  if (!valor) {
    return '';
  }

  const fecha = obtenerFechaFormateable(valor);
  const { anio, mes, dia, hora, minuto } = obtenerPartesFechaHoraLocal(fecha);

  return `${anio}-${mes}-${dia}T${hora}:${minuto}`;
}

export function convertirFechaHoraInputLocalAUTC(valor: string) {
  if (!valor) {
    return '';
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return '';
  }

  return fecha.toISOString();
}
