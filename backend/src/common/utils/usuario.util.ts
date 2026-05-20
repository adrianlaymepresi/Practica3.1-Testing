function normalizarFragmento(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function construirNombreUsuario(
  nombres: string,
  apellidos: string,
  ci: string,
) {
  const primerNombre = normalizarFragmento(nombres)[0] ?? '';
  const primerApellido = normalizarFragmento(apellidos)[0] ?? '';

  return `${primerNombre}${primerApellido}${ci}`.toUpperCase();
}

export function construirContraseniaInicial(ci: string, nombreRol: string) {
  return `${ci}${nombreRol.trim().toUpperCase()}`;
}
