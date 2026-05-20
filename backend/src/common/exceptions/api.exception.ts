import { HttpException, HttpStatus } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { MENSAJES } from '../constants/mensajes.constant';

interface ApiExceptionPayload {
  mensaje: string;
  errores?: unknown;
}

export class ApiException extends HttpException {
  constructor(mensaje: string, estado: HttpStatus, errores?: unknown) {
    super({ mensaje, errores }, estado);
  }

  static noEncontrado(mensaje: string = MENSAJES.RECURSO_NO_ENCONTRADO) {
    return new ApiException(mensaje, HttpStatus.NOT_FOUND);
  }

  static conflicto(
    mensaje: string = MENSAJES.DATOS_DUPLICADOS,
    errores?: unknown,
  ) {
    return new ApiException(mensaje, HttpStatus.CONFLICT, errores);
  }

  static solicitudInvalida(mensaje: string, errores?: unknown) {
    return new ApiException(mensaje, HttpStatus.BAD_REQUEST, errores);
  }

  static desdeSupabase(error: PostgrestError) {
    if (error.code === 'PGRST116') {
      return ApiException.noEncontrado();
    }

    if (error.code === '23505') {
      return ApiException.conflicto();
    }

    if (error.code === '23503') {
      return ApiException.solicitudInvalida(
        'No se puede completar la operacion por una relacion vinculada o inexistente',
        error.details,
      );
    }

    return new ApiException(
      error.message || MENSAJES.ERROR_SERVIDOR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      error.details,
    );
  }

  static obtenerPayload(exception: HttpException): ApiExceptionPayload {
    const respuesta = exception.getResponse();

    if (typeof respuesta === 'string') {
      return { mensaje: respuesta };
    }

    const payload = respuesta as Record<string, unknown>;
    const mensaje =
      typeof payload.mensaje === 'string'
        ? payload.mensaje
        : typeof payload.message === 'string'
          ? payload.message
          : MENSAJES.ERROR_SERVIDOR;

    return {
      mensaje,
      errores: payload.errores ?? payload.message,
    };
  }
}
