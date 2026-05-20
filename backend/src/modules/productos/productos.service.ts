import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import { ReferenciasRepository } from '../../common/database/referencias.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import {
  ArchivoSubido,
  obtenerExtensionArchivo,
  validarArchivoImagen,
} from '../../common/utils/archivos.util';
import {
  normalizarTextoCatalogo,
  normalizarTextoEspacios,
} from '../../common/utils/textos.util';
import { crearErrorCampo } from '../../common/utils/validacion.util';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { Producto } from './interfaces/producto.interface';
import { ProductosRepository } from './productos.repository';

@Injectable()
export class ProductosService {
  constructor(
    private readonly productosRepository: ProductosRepository,
    private readonly referenciasRepository: ReferenciasRepository,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  listar(paginacion: PaginacionQueryDto) {
    return this.productosRepository.listarProductos(paginacion);
  }

  async listarOpciones() {
    return {
      datos: await this.productosRepository.listarOpcionesActivas(),
    };
  }

  obtenerPorId(idProducto: string) {
    return this.productosRepository.obtenerPorId(idProducto);
  }

  async crear(
    crearProductoDto: CrearProductoDto,
    archivo?: ArchivoSubido,
  ) {
    const codigoProducto = normalizarTextoCatalogo(crearProductoDto.codigo_producto);
    const nombreProducto = normalizarTextoCatalogo(crearProductoDto.nombre_producto);

    await this.validarCodigoDisponible(codigoProducto);
    await this.validarNombreDisponible(nombreProducto);
    validarArchivoImagen(archivo, false);

    const idProducto = randomUUID();
    const datosImagen = archivo
      ? await this.subirImagenProducto(idProducto, archivo)
      : null;

    try {
      const producto = await this.productosRepository.crear({
        id_producto: idProducto,
        codigo_producto: codigoProducto,
        nombre_producto: nombreProducto,
        descripcion_producto: crearProductoDto.descripcion_producto
          ? normalizarTextoEspacios(crearProductoDto.descripcion_producto)
          : null,
        precio_producto: crearProductoDto.precio_producto,
        stock_producto: crearProductoDto.stock_producto,
        nombre_bucket_imagen_producto: datosImagen?.bucket ?? null,
        ruta_imagen_producto: datosImagen?.rutaArchivo ?? null,
        url_imagen_producto: datosImagen?.urlPublica ?? null,
        tipo_mime_imagen_producto: datosImagen?.tipoMime ?? null,
        tamano_bytes_imagen_producto: datosImagen?.tamanoBytes ?? null,
        es_activo_producto: true,
      });

      return {
        mensaje: MENSAJES.PRODUCTO_CREADO,
        datos: producto,
      };
    } catch (error) {
      if (datosImagen) {
        await this.eliminarArchivoStorage(
          datosImagen.bucket,
          datosImagen.rutaArchivo,
          true,
        );
      }

      throw error;
    }
  }

  async actualizar(
    idProducto: string,
    actualizarProductoDto: ActualizarProductoDto,
    archivo?: ArchivoSubido,
  ) {
    const productoActual = await this.obtenerPorId(idProducto);

    const codigoProductoNormalizado = actualizarProductoDto.codigo_producto
      ? normalizarTextoCatalogo(actualizarProductoDto.codigo_producto)
      : undefined;
    const nombreProductoNormalizado = actualizarProductoDto.nombre_producto
      ? normalizarTextoCatalogo(actualizarProductoDto.nombre_producto)
      : undefined;

    if (codigoProductoNormalizado) {
      await this.validarCodigoDisponible(codigoProductoNormalizado, idProducto);
    }

    if (nombreProductoNormalizado) {
      await this.validarNombreDisponible(nombreProductoNormalizado, idProducto);
    }

    if (archivo) {
      validarArchivoImagen(archivo, false);
    }

    const eliminarImagenActual =
      !archivo &&
      Boolean(actualizarProductoDto.eliminar_imagen_actual) &&
      Boolean(productoActual.ruta_imagen_producto);

    const nuevaImagen = archivo
      ? await this.subirImagenProducto(idProducto, archivo)
      : null;

    try {
      const producto = await this.productosRepository.actualizar(idProducto, {
        ...(codigoProductoNormalizado && {
          codigo_producto: codigoProductoNormalizado,
        }),
        ...(nombreProductoNormalizado && {
          nombre_producto: nombreProductoNormalizado,
        }),
        ...(actualizarProductoDto.descripcion_producto !== undefined && {
          descripcion_producto: actualizarProductoDto.descripcion_producto
            ? normalizarTextoEspacios(actualizarProductoDto.descripcion_producto)
            : null,
        }),
        ...(actualizarProductoDto.precio_producto !== undefined && {
          precio_producto: actualizarProductoDto.precio_producto,
        }),
        ...(actualizarProductoDto.stock_producto !== undefined && {
          stock_producto: actualizarProductoDto.stock_producto,
        }),
        ...(nuevaImagen && {
          nombre_bucket_imagen_producto: nuevaImagen.bucket,
          ruta_imagen_producto: nuevaImagen.rutaArchivo,
          url_imagen_producto: nuevaImagen.urlPublica,
          tipo_mime_imagen_producto: nuevaImagen.tipoMime,
          tamano_bytes_imagen_producto: nuevaImagen.tamanoBytes,
        }),
        ...(eliminarImagenActual && {
          nombre_bucket_imagen_producto: null,
          ruta_imagen_producto: null,
          url_imagen_producto: null,
          tipo_mime_imagen_producto: null,
          tamano_bytes_imagen_producto: null,
        }),
        updated_at: new Date().toISOString(),
      });

      if (
        nuevaImagen &&
        productoActual.nombre_bucket_imagen_producto &&
        productoActual.ruta_imagen_producto
      ) {
        await this.eliminarArchivoStorage(
          productoActual.nombre_bucket_imagen_producto,
          productoActual.ruta_imagen_producto,
          true,
        );
      }

      if (
        eliminarImagenActual &&
        productoActual.nombre_bucket_imagen_producto &&
        productoActual.ruta_imagen_producto
      ) {
        await this.eliminarArchivoStorage(
          productoActual.nombre_bucket_imagen_producto,
          productoActual.ruta_imagen_producto,
          true,
        );
      }

      return {
        mensaje: MENSAJES.PRODUCTO_ACTUALIZADO,
        datos: producto,
      };
    } catch (error) {
      if (nuevaImagen) {
        await this.eliminarArchivoStorage(
          nuevaImagen.bucket,
          nuevaImagen.rutaArchivo,
          true,
        );
      }

      throw error;
    }
  }

  async archivar(idProducto: string) {
    await this.obtenerPorId(idProducto);

    const producto = await this.productosRepository.actualizar(idProducto, {
      es_activo_producto: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_ARCHIVADO,
      datos: producto,
    };
  }

  async reactivar(idProducto: string) {
    await this.obtenerPorId(idProducto);

    const producto = await this.productosRepository.actualizar(idProducto, {
      es_activo_producto: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_REACTIVADO,
      datos: producto,
    };
  }

  async eliminar(idProducto: string) {
    const producto = await this.obtenerPorId(idProducto);
    const totalDetalles = await this.referenciasRepository.contarPorCampo(
      'detalleorden',
      'id_producto',
      idProducto,
    );

    if (totalDetalles > 0) {
      throw ApiException.solicitudInvalida(
        'No se puede eliminar el producto porque tiene detalles de orden vinculados',
        crearErrorCampo(
          'id_producto',
          'No puedes eliminar un producto mientras este vinculado a detalles de orden',
        ),
      );
    }

    await this.productosRepository.eliminarFisico(idProducto);

    if (
      producto.nombre_bucket_imagen_producto &&
      producto.ruta_imagen_producto
    ) {
      await this.eliminarArchivoStorage(
        producto.nombre_bucket_imagen_producto,
        producto.ruta_imagen_producto,
        true,
      );
    }

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_producto: idProducto },
    };
  }

  private async validarCodigoDisponible(
    codigoProducto: string,
    idActual?: string,
  ) {
    const productoExistente =
      await this.productosRepository.buscarPorCodigo(codigoProducto);

    if (productoExistente && productoExistente.id_producto !== idActual) {
      throw ApiException.conflicto(
        'Ya existe un producto con ese codigo',
        crearErrorCampo(
          'codigo_producto',
          'Ya existe un producto con ese codigo',
        ),
      );
    }
  }

  private async validarNombreDisponible(
    nombreProducto: string,
    idActual?: string,
  ) {
    const productoExistente =
      await this.productosRepository.buscarPorNombre(nombreProducto);

    if (productoExistente && productoExistente.id_producto !== idActual) {
      throw ApiException.conflicto(
        'Ya existe un producto con ese nombre',
        crearErrorCampo(
          'nombre_producto',
          'Ya existe un producto con ese nombre',
        ),
      );
    }
  }

  private async subirImagenProducto(idProducto: string, archivo: ArchivoSubido) {
    const bucket = this.obtenerBucketImagenesProductos();
    const rutaArchivo = this.construirRutaArchivo(idProducto, archivo);
    const urlPublica = await this.subirArchivoStorage(
      bucket,
      rutaArchivo,
      archivo,
    );

    return {
      bucket,
      rutaArchivo,
      urlPublica,
      tipoMime: archivo.mimetype,
      tamanoBytes: archivo.size,
    };
  }

  private construirRutaArchivo(idProducto: string, archivo: ArchivoSubido) {
    const extension = obtenerExtensionArchivo(
      archivo.originalname,
      archivo.mimetype,
    );

    return `productos/${idProducto}/${Date.now()}.${extension}`;
  }

  private async subirArchivoStorage(
    bucket: string,
    rutaArchivo: string,
    archivo: ArchivoSubido,
  ) {
    const baseUrl =
      this.configService.get<string>('entorno.supabase.url') ?? '';

    const { error } = await this.supabaseService.cliente.storage
      .from(bucket)
      .upload(rutaArchivo, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: false,
      });

    if (error) {
      throw ApiException.solicitudInvalida(
        'No se pudo guardar la imagen del producto en Supabase Storage',
        error.message,
      );
    }

    const urlPublica = this.supabaseService.cliente.storage
      .from(bucket)
      .getPublicUrl(rutaArchivo);

    return (
      urlPublica.data.publicUrl ||
      `${baseUrl}/storage/v1/object/public/${bucket}/${rutaArchivo}`
    );
  }

  private async eliminarArchivoStorage(
    bucket: string,
    rutaArchivo: string,
    ignorarError = false,
  ) {
    const { error } = await this.supabaseService.cliente.storage
      .from(bucket)
      .remove([rutaArchivo]);

    if (error && !ignorarError) {
      throw ApiException.solicitudInvalida(
        'No se pudo eliminar la imagen del almacenamiento',
        error.message,
      );
    }
  }

  private obtenerBucketImagenesProductos() {
    const bucket = this.configService.get<string>(
      'entorno.supabase.bucketImagenesProductos',
    );

    if (!bucket) {
      throw ApiException.solicitudInvalida(
        'No se encontro configurado el bucket de imagenes de productos',
      );
    }

    return bucket;
  }
}
