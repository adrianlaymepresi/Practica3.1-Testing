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
import { ActualizarDetallePedidoDto } from './dto/actualizar-detalle-pedido.dto';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearDetallePedidoDto } from './dto/crear-detalle-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { DetallePedidosService } from './detalle-pedidos.service';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly detallePedidosService: DetallePedidosService,
  ) {}

  @Get()
  listar(@Query() paginacion: PaginacionQueryDto) {
    return this.pedidosService.listar(paginacion);
  }

  @Get(':id/detalles')
  listarDetalles(
    @Param('id') idPedido: string,
    @Query() paginacion: PaginacionQueryDto,
  ) {
    return this.detallePedidosService.listar(idPedido, paginacion);
  }

  @Get(':id')
  obtenerPorId(@Param('id') idPedido: string) {
    return this.pedidosService.obtenerPorId(idPedido);
  }

  @Post()
  crear(@Body() crearPedidoDto: CrearPedidoDto) {
    return this.pedidosService.crear(crearPedidoDto);
  }

  @Post(':id/detalles')
  crearDetalle(
    @Param('id') idPedido: string,
    @Body() crearDetallePedidoDto: CrearDetallePedidoDto,
  ) {
    return this.detallePedidosService.crear(idPedido, crearDetallePedidoDto);
  }

  @Patch(':id')
  actualizar(
    @Param('id') idPedido: string,
    @Body() actualizarPedidoDto: ActualizarPedidoDto,
  ) {
    return this.pedidosService.actualizar(idPedido, actualizarPedidoDto);
  }

  @Patch(':id/detalles/:idDetalle')
  actualizarDetalle(
    @Param('id') idPedido: string,
    @Param('idDetalle') idDetalle: string,
    @Body() actualizarDetallePedidoDto: ActualizarDetallePedidoDto,
  ) {
    return this.detallePedidosService.actualizar(
      idPedido,
      idDetalle,
      actualizarDetallePedidoDto,
    );
  }

  @Patch(':id/archivar')
  archivar(@Param('id') idPedido: string) {
    return this.pedidosService.archivar(idPedido);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') idPedido: string) {
    return this.pedidosService.reactivar(idPedido);
  }

  @Delete(':id/detalles/:idDetalle')
  eliminarDetalle(
    @Param('id') idPedido: string,
    @Param('idDetalle') idDetalle: string,
  ) {
    return this.detallePedidosService.eliminar(idPedido, idDetalle);
  }

  @Delete(':id')
  eliminar(@Param('id') idPedido: string) {
    return this.pedidosService.eliminar(idPedido);
  }
}
