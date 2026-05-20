export function normalizarTextoEspacios(valor: string) {
  return valor.trim().replace(/\s+/g, ' ');
}

export function normalizarTextoCatalogo(valor: string) {
  return normalizarTextoEspacios(valor).toUpperCase();
}
