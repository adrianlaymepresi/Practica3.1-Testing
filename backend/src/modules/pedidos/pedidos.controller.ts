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
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import type { UsuarioJwt } from '../../common/interfaces/usuario-jwt.interface';
import { ActualizarDetallePedidoDto } from './dto/actualizar-detalle-pedido.dto';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { CrearDetallePedidoDto } from './dto/crear-detalle-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { DetallePedidosService } from './detalle-pedidos.service';
import { PedidosService } from './pedidos.service';

@RolesPermitidos(ROLES_SISTEMA.ADMINISTRADOR, ROLES_SISTEMA.AYUDANTE)
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

  @Get('siguiente-codigo')
  obtenerSiguienteCodigo() {
    return this.pedidosService.obtenerSiguienteCodigo();
  }

  @Get(':id/detalles')
  listarDetalles(
    @Param('id') idPedido: string,
    @Query() paginacion: PaginacionQueryDto,
  ) {
    return this.detallePedidosService.listar(idPedido, paginacion);
  }

  @Get(':id/productos-disponibles')
  listarProductosDisponibles(
    @Param('id') idPedido: string,
    @Query('idDetalleActual') idDetalleActual?: string,
  ) {
    return this.detallePedidosService.listarProductosDisponibles(
      idPedido,
      idDetalleActual,
    );
  }

  @Get(':id/recibo')
  obtenerDatosRecibo(@Param('id') idPedido: string) {
    return this.pedidosService.obtenerDatosRecibo(idPedido);
  }

  @Get(':id')
  obtenerPorId(@Param('id') idPedido: string) {
    return this.pedidosService.obtenerPorId(idPedido);
  }

  @Post()
  crear(
    @Body() crearPedidoDto: CrearPedidoDto,
    @UsuarioActual() usuario: UsuarioJwt,
  ) {
    return this.pedidosService.crear(crearPedidoDto, usuario);
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
    @UsuarioActual() usuario: UsuarioJwt,
  ) {
    return this.pedidosService.actualizar(idPedido, actualizarPedidoDto, usuario);
  }

  @Patch(':id/estado')
  cambiarEstadoPedido(
    @Param('id') idPedido: string,
    @Body() cambiarEstadoPedidoDto: CambiarEstadoPedidoDto,
  ) {
    return this.pedidosService.cambiarEstadoPedido(
      idPedido,
      cambiarEstadoPedidoDto.estado_orden_pedido,
    );
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
