import { solicitarApi } from '@/src/lib/api/cliente-api';
import {
  ParametrosPaginacion,
  RespuestaPaginada,
} from '@/src/types/api.types';
import {
  ActualizarProductoPayload,
  CrearProductoPayload,
  Producto,
} from '@/src/types/productos.types';

function construirFormDataProducto(
  datos: CrearProductoPayload | ActualizarProductoPayload,
) {
  const formData = new FormData();

  formData.append('codigo_producto', datos.codigo_producto);
  formData.append('nombre_producto', datos.nombre_producto);
  formData.append('precio_producto', datos.precio_producto);
  formData.append('stock_producto', datos.stock_producto);

  if (datos.descripcion_producto) {
    formData.append('descripcion_producto', datos.descripcion_producto);
  }

  if ('eliminar_imagen_actual' in datos && datos.eliminar_imagen_actual) {
    formData.append('eliminar_imagen_actual', 'true');
  }

  if (datos.archivo) {
    formData.append('archivo', datos.archivo);
  }

  return formData;
}

export function listarProductos(parametros: ParametrosPaginacion) {
  return solicitarApi<RespuestaPaginada<Producto>>('/productos', {
    parametros,
  });
}

export function crearProducto(datos: CrearProductoPayload) {
  return solicitarApi<Producto, FormData>('/productos', {
    metodo: 'POST',
    cuerpo: construirFormDataProducto(datos),
  });
}

export function actualizarProducto(
  idProducto: string,
  datos: ActualizarProductoPayload,
) {
  return solicitarApi<Producto, FormData>(`/productos/${idProducto}`, {
    metodo: 'PATCH',
    cuerpo: construirFormDataProducto(datos),
  });
}

export function archivarProducto(idProducto: string) {
  return solicitarApi<Producto>(`/productos/${idProducto}/archivar`, {
    metodo: 'PATCH',
  });
}

export function reactivarProducto(idProducto: string) {
  return solicitarApi<Producto>(`/productos/${idProducto}/reactivar`, {
    metodo: 'PATCH',
  });
}

export function eliminarProducto(idProducto: string) {
  return solicitarApi<{ id_producto: string }>(`/productos/${idProducto}`, {
    metodo: 'DELETE',
  });
}
