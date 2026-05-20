import { BadRequestException, ValidationError } from '@nestjs/common';

export interface ErrorCampo {
  campo: string;
  mensajes: string[];
}

export function crearErrorCampo(campo: string, mensaje: string): ErrorCampo[] {
  return [{ campo, mensajes: [mensaje] }];
}

function obtenerErroresCampo(
  error: ValidationError,
  rutaPadre = '',
): ErrorCampo[] {
  const campo = rutaPadre ? `${rutaPadre}.${error.property}` : error.property;
  const mensajes = Object.values(error.constraints ?? {});
  const errores: ErrorCampo[] =
    mensajes.length > 0 ? [{ campo, mensajes }] : [];

  return errores.concat(
    (error.children ?? []).flatMap((hijo) => obtenerErroresCampo(hijo, campo)),
  );
}

export function crearExcepcionValidacion(errores: ValidationError[]) {
  return new BadRequestException({
    mensaje: 'Hay campos con informacion invalida',
    errores: errores.flatMap((error) => obtenerErroresCampo(error)),
  });
}
