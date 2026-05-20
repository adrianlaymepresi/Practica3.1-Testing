export interface Producto {
  id_producto: string;
  codigo_producto: string;
  nombre_producto: string;
  descripcion_producto: string | null;
  precio_producto: number;
  stock_producto: number;
  nombre_bucket_imagen_producto: string | null;
  ruta_imagen_producto: string | null;
  url_imagen_producto: string | null;
  tipo_mime_imagen_producto: string | null;
  tamano_bytes_imagen_producto: number | null;
  es_activo_producto: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CrearProductoPayload {
  codigo_producto: string;
  nombre_producto: string;
  descripcion_producto?: string;
  precio_producto: string;
  stock_producto: string;
  archivo?: File | null;
}

export interface ActualizarProductoPayload extends CrearProductoPayload {
  eliminar_imagen_actual?: boolean;
}
