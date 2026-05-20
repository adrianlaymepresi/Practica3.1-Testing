import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { MENSAJES } from '../constants/mensajes.constant';
import { RespuestaApi } from '../interfaces/respuesta-api.interface';

interface RespuestaConMensaje<TDatos> {
  mensaje?: string;
  datos: TDatos;
}

@Injectable()
export class RespuestaInterceptor<TDatos> implements NestInterceptor<
  TDatos,
  RespuestaApi<TDatos>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<TDatos | RespuestaConMensaje<TDatos>>,
  ): Observable<RespuestaApi<TDatos>> {
    return next.handle().pipe(
      map((respuesta) => {
        if (
          respuesta &&
          typeof respuesta === 'object' &&
          'datos' in respuesta
        ) {
          return {
            exito: true,
            mensaje: respuesta.mensaje ?? MENSAJES.OPERACION_EXITOSA,
            datos: respuesta.datos,
          };
        }

        return {
          exito: true,
          mensaje: MENSAJES.OPERACION_EXITOSA,
          datos: respuesta,
        };
      }),
    );
  }
}
