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
import { ROLES_SISTEMA } from '../../common/constants/roles.constant';
import { RolesPermitidos } from '../../common/decorators/roles.decorator';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import { EmpleadosService } from './empleados.service';

@RolesPermitidos(ROLES_SISTEMA.ADMINISTRADOR)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  listar(@Query() paginacion: PaginacionQueryDto) {
    return this.empleadosService.listar(paginacion);
  }

  @Get('opciones')
  @RolesPermitidos(ROLES_SISTEMA.ADMINISTRADOR, ROLES_SISTEMA.AYUDANTE)
  listarOpciones() {
    return this.empleadosService.listarOpciones();
  }

  @Get(':id')
  obtenerPorId(@Param('id') idEmpleado: string) {
    return this.empleadosService.obtenerPorId(idEmpleado);
  }

  @Post()
  crear(@Body() crearEmpleadoDto: CrearEmpleadoDto) {
    return this.empleadosService.crear(crearEmpleadoDto);
  }

  @Patch(':id')
  actualizar(
    @Param('id') idEmpleado: string,
    @Body() actualizarEmpleadoDto: ActualizarEmpleadoDto,
  ) {
    return this.empleadosService.actualizar(idEmpleado, actualizarEmpleadoDto);
  }

  @Patch(':id/archivar')
  archivar(@Param('id') idEmpleado: string) {
    return this.empleadosService.archivar(idEmpleado);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') idEmpleado: string) {
    return this.empleadosService.reactivar(idEmpleado);
  }

  @Delete(':id')
  eliminar(@Param('id') idEmpleado: string) {
    return this.empleadosService.eliminar(idEmpleado);
  }
}
