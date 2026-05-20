import {
  formatearFechaHoraZonaHoraria,
  formatearFechaSimpleZonaHoraria,
} from '@/src/lib/utils/fechas';

export function formatearFechaDetalle(valor?: string | null) {
  return formatearFechaHoraZonaHoraria(valor);
}

export function formatearFechaSimpleDetalle(valor?: string | null) {
  return formatearFechaSimpleZonaHoraria(valor);
}

export function formatearEstadoRegistro(activo: boolean) {
  return activo ? 'Activo' : 'Archivado';
}
