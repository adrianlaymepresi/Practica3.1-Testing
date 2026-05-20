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

export type CrearProducto = Pick<
  Producto,
  | 'id_producto'
  | 'codigo_producto'
  | 'nombre_producto'
  | 'descripcion_producto'
  | 'precio_producto'
  | 'stock_producto'
  | 'nombre_bucket_imagen_producto'
  | 'ruta_imagen_producto'
  | 'url_imagen_producto'
  | 'tipo_mime_imagen_producto'
  | 'tamano_bytes_imagen_producto'
  | 'es_activo_producto'
>;

export type ActualizarProducto = Partial<CrearProducto> & {
  updated_at: string;
  deleted_at?: string | null;
};
