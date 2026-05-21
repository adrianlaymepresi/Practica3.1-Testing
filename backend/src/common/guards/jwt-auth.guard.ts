import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { MENSAJES } from '../constants/mensajes.constant';
import { CLAVE_RUTA_PUBLICA } from '../decorators/publico.decorator';
import { ApiException } from '../exceptions/api.exception';
import { UsuarioJwt } from '../interfaces/usuario-jwt.interface';
import { verificarJwtHs256 } from '../utils/jwt.util';

interface RequestConCookies {
  cookies?: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  usuario?: UsuarioJwt;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(contexto: ExecutionContext) {
    const esPublica = this.reflector.getAllAndOverride<boolean>(
      CLAVE_RUTA_PUBLICA,
      [contexto.getHandler(), contexto.getClass()],
    );

    if (esPublica) {
      return true;
    }

    const request = contexto.switchToHttp().getRequest<RequestConCookies>();
    const nombreCookie = this.configService.get<string>(
      'entorno.cookies.accessToken',
    );
    const tokenBearer = this.extraerTokenBearer(request.headers?.authorization);
    const tokenCookie = nombreCookie
      ? request.cookies?.[nombreCookie]
      : undefined;
    const token = tokenBearer ?? tokenCookie;
    const secreto = this.configService.get<string>('entorno.jwt.accessSecret');

    if (!token || !secreto) {
      throw ApiException.noAutorizado(MENSAJES.NO_AUTORIZADO);
    }

    const usuario = verificarJwtHs256<UsuarioJwt>(token, secreto);

    if (!usuario) {
      throw ApiException.noAutorizado(MENSAJES.NO_AUTORIZADO);
    }

    request.usuario = usuario;
    return true;
  }

  private extraerTokenBearer(authorization?: string | string[]) {
    const value = Array.isArray(authorization)
      ? authorization[0]
      : authorization;

    if (!value) {
      return undefined;
    }

    const [scheme, token] = value.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token?.trim()) {
      return undefined;
    }

    return token.trim();
  }
}
