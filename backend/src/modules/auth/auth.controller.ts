import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Publico } from '../../common/decorators/publico.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import type { UsuarioJwt } from '../../common/interfaces/usuario-jwt.interface';
import { AuthService } from './auth.service';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('iniciar-sesion')
  iniciarSesion(
    @Body() iniciarSesionDto: IniciarSesionDto,
    @Res({ passthrough: true }) respuesta: Response,
  ) {
    return this.authService.iniciarSesion(iniciarSesionDto, respuesta);
  }

  @Post('cerrar-sesion')
  cerrarSesion(@Res({ passthrough: true }) respuesta: Response) {
    return this.authService.cerrarSesion(respuesta);
  }

  @Get('perfil')
  obtenerPerfil(@UsuarioActual() usuario: UsuarioJwt) {
    return this.authService.obtenerPerfil(usuario);
  }
}
