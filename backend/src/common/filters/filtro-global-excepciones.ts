import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { MENSAJES } from '../constants/mensajes.constant';
import { ApiException } from '../exceptions/api.exception';

@Catch()
export class FiltroGlobalExcepciones implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<Response>();

    const estado =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? ApiException.obtenerPayload(exception)
        : { mensaje: MENSAJES.ERROR_SERVIDOR };

    respuesta.status(estado).json({
      exito: false,
      mensaje: payload.mensaje,
      errores: payload.errores,
    });
  }
}
