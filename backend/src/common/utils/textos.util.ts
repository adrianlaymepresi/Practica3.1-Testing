export function normalizarTextoEspacios(valor: string) {
  return valor.trim().replace(/\s+/g, ' ');
}

export function normalizarTextoCatalogo(valor: string) {
  return normalizarTextoEspacios(valor).toUpperCase();
}

export function normalizarNombrePersona(valor: string) {
  return normalizarTextoEspacios(valor)
    .toLocaleUpperCase('es-BO')
    .replace(/[^A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizarCorreoElectronico(valor: string) {
  return normalizarTextoEspacios(valor).toLowerCase();
}

export function normalizarTelefono(valor: string) {
  const telefonoLimpio = valor.replace(/[^0-9+]/g, '');
  const prefijo = telefonoLimpio.startsWith('+') ? '+' : '';
  const numero = telefonoLimpio.replace(/\+/g, '');

  return `${prefijo}${numero}`.slice(0, 20);
}
