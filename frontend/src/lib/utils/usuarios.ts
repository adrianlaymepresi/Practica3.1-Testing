function extraerPrimerFragmento(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0] ?? '';
}

export function construirNombreUsuario(
  nombres: string,
  apellidos: string,
  ci: string,
) {
  return `${extraerPrimerFragmento(nombres)}${extraerPrimerFragmento(
    apellidos,
  )}${ci}`.toUpperCase();
}

export function construirContraseniaUsuario(ci: string, nombreRol: string) {
  return `${ci}${nombreRol.trim().toUpperCase()}`;
}
