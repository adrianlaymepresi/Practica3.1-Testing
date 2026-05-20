export const PATRON_CORREO_ELECTRONICO =
  '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';

export const PATRON_NOMBRE_PERSONA =
  '^[A-Z\\u00C1\\u00C9\\u00CD\\u00D3\\u00DA\\u00DC\\u00D1 ]{3,120}$';

export const PATRON_TELEFONO_INTERNACIONAL = '^\\+?[0-9]{7,20}$';

export function normalizarCi(valor: string, maximo = 20) {
  return valor.replace(/[^0-9]/g, '').slice(0, maximo);
}

export function normalizarTelefono(valor: string, maximo = 20) {
  const limpio = valor.replace(/[^0-9+]/g, '');
  const prefijo = limpio.startsWith('+') ? '+' : '';
  const numero = limpio.replace(/\+/g, '');

  return `${prefijo}${numero}`.slice(0, maximo);
}

export function normalizarCorreo(valor: string, maximo = 120) {
  return valor.trim().toLowerCase().slice(0, maximo);
}

export function normalizarNombrePersona(valor: string, maximo = 120) {
  return valor
    .toLocaleUpperCase('es-BO')
    .replace(/[^A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trimStart()
    .slice(0, maximo);
}

export function normalizarContrasenia(valor: string, maximo = 72) {
  return valor.replace(/\s/g, '').slice(0, maximo);
}
