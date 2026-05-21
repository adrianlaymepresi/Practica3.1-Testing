import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioJwt } from '../interfaces/usuario-jwt.interface';

interface RequestConUsuario {
  usuario?: UsuarioJwt;
}

export const UsuarioActual = createParamDecorator(
  (_data: unknown, contexto: ExecutionContext) => {
    const request = contexto.switchToHttp().getRequest<RequestConUsuario>();
    return request.usuario;
  },
);
