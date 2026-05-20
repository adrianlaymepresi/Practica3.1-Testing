import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar(@Query() paginacion: PaginacionQueryDto) {
    return this.usuariosService.listar(paginacion);
  }

  @Get(':id')
  obtenerPorId(@Param('id') idUsuario: string) {
    return this.usuariosService.obtenerPorId(idUsuario);
  }

  @Post()
  crear(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }

  @Patch(':id')
  actualizar(
    @Param('id') idUsuario: string,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizar(idUsuario, actualizarUsuarioDto);
  }

  @Patch(':id/archivar')
  archivar(@Param('id') idUsuario: string) {
    return this.usuariosService.archivar(idUsuario);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') idUsuario: string) {
    return this.usuariosService.reactivar(idUsuario);
  }

  @Delete(':id')
  eliminar(@Param('id') idUsuario: string) {
    return this.usuariosService.eliminar(idUsuario);
  }
}
