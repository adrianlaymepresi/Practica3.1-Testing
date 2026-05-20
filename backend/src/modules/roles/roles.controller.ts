import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { CrearRolDto } from './dto/crear-rol.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  listar(@Query() paginacion: PaginacionQueryDto) {
    return this.rolesService.listar(paginacion);
  }

  @Get(':id')
  obtenerPorId(@Param('id') idRol: string) {
    return this.rolesService.obtenerPorId(idRol);
  }

  @Post()
  crear(@Body() crearRolDto: CrearRolDto) {
    return this.rolesService.crear(crearRolDto);
  }

  @Patch(':id')
  actualizar(
    @Param('id') idRol: string,
    @Body() actualizarRolDto: ActualizarRolDto,
  ) {
    return this.rolesService.actualizar(idRol, actualizarRolDto);
  }

  @Patch(':id/archivar')
  archivar(@Param('id') idRol: string) {
    return this.rolesService.archivar(idRol);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') idRol: string) {
    return this.rolesService.reactivar(idRol);
  }

  @Delete(':id')
  eliminar(@Param('id') idRol: string) {
    return this.rolesService.eliminar(idRol);
  }
}
