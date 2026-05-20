import * as bcrypt from 'bcryptjs';

const RONDAS_HASH = 12;

export function hashearContrasenia(contrasenia: string) {
  return bcrypt.hash(contrasenia, RONDAS_HASH);
}

export function compararContrasenia(
  contraseniaPlana: string,
  contraseniaHasheada: string,
) {
  return bcrypt.compare(contraseniaPlana, contraseniaHasheada);
}
