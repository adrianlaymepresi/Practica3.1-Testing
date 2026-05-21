import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import {
  ROLES_PANEL,
  ROLES_SISTEMA,
  RolSistema,
} from '../../common/constants/roles.constant';
import { ApiException } from '../../common/exceptions/api.exception';
import { UsuarioJwt } from '../../common/interfaces/usuario-jwt.interface';
import { compararContrasenia } from '../../common/utils/bcrypt.util';
import {
  construirOpcionesCookieSesion,
  construirOpcionesLimpiarCookie,
} from '../../common/utils/cookies.util';
import {
  convertirDuracionAMilisegundos,
  crearJwtHs256,
} from '../../common/utils/jwt.util';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import {
  SesionActiva,
  UsuarioAutenticacion,
} from './interfaces/sesion-activa.interface';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async iniciarSesion(iniciarSesionDto: IniciarSesionDto, respuesta: Response) {
    const usuario = await this.autenticarUsuario(iniciarSesionDto);
    this.validarAccesoPanel(usuario);
    const sesionActualizada = await this.registrarSesionActiva(usuario);
    const nombreCookie = this.configService.get<string>(
      'entorno.cookies.accessToken',
    );
    const token = this.generarTokenAcceso(sesionActualizada);

    if (!nombreCookie) {
      throw ApiException.solicitudInvalida(
        'La configuracion de autenticacion esta incompleta',
      );
    }

    const expiresIn =
      this.configService.get<string>('entorno.jwt.accessExpiresIn') ?? '1d';

    respuesta.cookie(
      nombreCookie,
      token,
      construirOpcionesCookieSesion(
        this.configService,
        convertirDuracionAMilisegundos(expiresIn),
      ),
    );

    return {
      mensaje: MENSAJES.SESION_INICIADA,
      datos: sesionActualizada,
    };
  }

  cerrarSesion(respuesta: Response) {
    const nombreCookie = this.configService.get<string>(
      'entorno.cookies.accessToken',
    );

    if (nombreCookie) {
      respuesta.clearCookie(
        nombreCookie,
        construirOpcionesLimpiarCookie(this.configService),
      );
    }

    return {
      mensaje: MENSAJES.SESION_CERRADA,
      datos: { sesion_cerrada: true },
    };
  }

  async obtenerPerfil(usuarioJwt: UsuarioJwt) {
    const usuario = await this.authRepository.obtenerParaSesion(usuarioJwt.sub);
    this.validarAccesoPanel(usuario);
    return { datos: this.construirSesionActiva(usuario) };
  }

  private async autenticarUsuario(iniciarSesionDto: IniciarSesionDto) {
    const nombreUsuario = iniciarSesionDto.nombre_usuario.trim().toUpperCase();
    const usuario =
      await this.authRepository.buscarPorNombreUsuario(nombreUsuario);

    if (!usuario || !usuario.contrasenia_usuario) {
      throw ApiException.noAutorizado('Usuario o contrasenia incorrectos');
    }

    const contraseniaValida = await compararContrasenia(
      iniciarSesionDto.contrasenia,
      usuario.contrasenia_usuario,
    );

    if (!contraseniaValida) {
      throw ApiException.noAutorizado('Usuario o contrasenia incorrectos');
    }

    return usuario;
  }

  private async registrarSesionActiva(usuario: UsuarioAutenticacion) {
    const ahora = new Date().toISOString();

    await this.authRepository.actualizarDatosSesion(usuario.id_usuario, {
      ultima_sesion_usuario: ahora,
      updated_at: ahora,
    });

    return this.construirSesionActiva({
      ...usuario,
      ultima_sesion_usuario: ahora,
    });
  }

  private construirSesionActiva(usuario: UsuarioAutenticacion): SesionActiva {
    const rol = (usuario.rol?.nombre_rol ?? ROLES_SISTEMA.AYUDANTE) as RolSistema;
    const nombreCompleto = [
      usuario.empleado?.nombres_completo_empleado ?? '',
      usuario.empleado?.apellidos_completo_empleado ?? '',
    ]
      .join(' ')
      .trim();

    return {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      nombre_completo: nombreCompleto,
      ci_empleado: usuario.empleado?.ci_empleado ?? '',
      rol,
      ultima_sesion_usuario: usuario.ultima_sesion_usuario,
      telefono_empleado: usuario.empleado?.telefono_empleado ?? null,
      correo_electronico_empleado:
        usuario.empleado?.correo_electronico_empleado ?? null,
    };
  }

  private generarTokenAcceso(sesionActiva: SesionActiva) {
    const secreto = this.configService.get<string>('entorno.jwt.accessSecret');
    const expiresIn =
      this.configService.get<string>('entorno.jwt.accessExpiresIn') ?? '1d';

    if (!secreto) {
      throw ApiException.solicitudInvalida(
        'La configuracion de autenticacion esta incompleta',
      );
    }

    return crearJwtHs256<UsuarioJwt>(
      {
        sub: sesionActiva.id_usuario,
        nombre_usuario: sesionActiva.nombre_usuario,
        rol: sesionActiva.rol,
        nombre_completo: sesionActiva.nombre_completo,
        ci_empleado: sesionActiva.ci_empleado,
      },
      secreto,
      expiresIn,
    );
  }

  private validarAccesoPanel(usuario: UsuarioAutenticacion) {
    const rolUsuario = usuario.rol?.nombre_rol;

    if (
      !usuario.es_activo_usuario ||
      usuario.deleted_at ||
      !usuario.empleado?.es_activo_empleado ||
      usuario.empleado.deleted_at ||
      !usuario.rol?.es_activo_rol ||
      !rolUsuario ||
      !ROLES_PANEL.includes(rolUsuario as RolSistema)
    ) {
      throw ApiException.noAutorizado(
        'Tu usuario no tiene acceso al panel administrativo',
      );
    }
  }
}
