import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import type { ArchivoSubido } from '../../common/utils/archivos.util';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  listar(@Query() paginacion: PaginacionQueryDto) {
    return this.productosService.listar(paginacion);
  }

  @Get('opciones')
  listarOpciones() {
    return this.productosService.listarOpciones();
  }

  @Get(':id')
  obtenerPorId(@Param('id') idProducto: string) {
    return this.productosService.obtenerPorId(idProducto);
  }

  @Post()
  @UseInterceptors(FileInterceptor('archivo'))
  crear(
    @Body() crearProductoDto: CrearProductoDto,
    @UploadedFile() archivo?: ArchivoSubido,
  ) {
    return this.productosService.crear(crearProductoDto, archivo);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('archivo'))
  actualizar(
    @Param('id') idProducto: string,
    @Body() actualizarProductoDto: ActualizarProductoDto,
    @UploadedFile() archivo?: ArchivoSubido,
  ) {
    return this.productosService.actualizar(
      idProducto,
      actualizarProductoDto,
      archivo,
    );
  }

  @Patch(':id/archivar')
  archivar(@Param('id') idProducto: string) {
    return this.productosService.archivar(idProducto);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') idProducto: string) {
    return this.productosService.reactivar(idProducto);
  }

  @Delete(':id')
  eliminar(@Param('id') idProducto: string) {
    return this.productosService.eliminar(idProducto);
  }
}
