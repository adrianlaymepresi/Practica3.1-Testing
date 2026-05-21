import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLAVE_ROLES_PERMITIDOS } from '../decorators/roles.decorator';
import { ApiException } from '../exceptions/api.exception';
import { UsuarioJwt } from '../interfaces/usuario-jwt.interface';

interface RequestConUsuario {
  usuario?: UsuarioJwt;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext) {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      CLAVE_ROLES_PERMITIDOS,
      [contexto.getHandler(), contexto.getClass()],
    );

    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const request = contexto.switchToHttp().getRequest<RequestConUsuario>();
    const rolActual = request.usuario?.rol;

    if (!rolActual || !rolesPermitidos.includes(rolActual)) {
      throw ApiException.prohibido();
    }

    return true;
  }
}
