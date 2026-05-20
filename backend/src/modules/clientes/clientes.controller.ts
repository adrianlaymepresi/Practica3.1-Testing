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
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(@Query() paginacion: PaginacionQueryDto) {
    return this.clientesService.listar(paginacion);
  }

  @Get('opciones')
  listarOpciones() {
    return this.clientesService.listarOpciones();
  }

  @Get(':id')
  obtenerPorId(@Param('id') idCliente: string) {
    return this.clientesService.obtenerPorId(idCliente);
  }

  @Post()
  crear(@Body() crearClienteDto: CrearClienteDto) {
    return this.clientesService.crear(crearClienteDto);
  }

  @Patch(':id')
  actualizar(
    @Param('id') idCliente: string,
    @Body() actualizarClienteDto: ActualizarClienteDto,
  ) {
    return this.clientesService.actualizar(idCliente, actualizarClienteDto);
  }

  @Patch(':id/archivar')
  archivar(@Param('id') idCliente: string) {
    return this.clientesService.archivar(idCliente);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') idCliente: string) {
    return this.clientesService.reactivar(idCliente);
  }

  @Delete(':id')
  eliminar(@Param('id') idCliente: string) {
    return this.clientesService.eliminar(idCliente);
  }
}
