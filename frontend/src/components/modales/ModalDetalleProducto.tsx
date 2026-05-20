'use client';

import { ImageOff } from 'lucide-react';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import {
  formatearFechaDetalle,
  formatearFechaSimpleDetalle,
  formatearEstadoRegistro,
} from '@/src/lib/utils/detalle-registro';
import {
  formatearPrecioProducto,
  formatearTamanoArchivo,
} from '@/src/lib/utils/productos';
import { Producto } from '@/src/types/productos.types';

interface ModalDetalleProductoProps {
  producto: Producto | null;
  alCerrar: () => void;
}

export function ModalDetalleProducto({
  producto,
  alCerrar,
}: ModalDetalleProductoProps) {
  if (!producto) {
    return null;
  }

  return (
    <ModalFormulario
      abierto={Boolean(producto)}
      titulo={`Producto ${producto.codigo_producto}`}
      descripcion="Informacion completa del producto seleccionado."
      alCerrar={alCerrar}
    >
      <div className="producto-detalle">
        <div className="producto-detalle__media">
          {producto.url_imagen_producto ? (
            <img
              src={producto.url_imagen_producto}
              alt={producto.nombre_producto}
              className="producto-detalle__imagen"
            />
          ) : (
            <div className="producto-detalle__placeholder">
              <ImageOff size={34} aria-hidden="true" />
              <span>Sin imagen registrada</span>
            </div>
          )}
        </div>
        <div className="detalle-registro__contenido">
          <section className="detalle-registro__seccion">
            <h4>Datos principales</h4>
            <dl className="detalle-registro__lista">
              <div className="detalle-registro__fila">
                <dt>UUID</dt>
                <dd>{producto.id_producto}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Codigo</dt>
                <dd>{producto.codigo_producto}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Nombre</dt>
                <dd>{producto.nombre_producto}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Descripcion</dt>
                <dd>{producto.descripcion_producto ?? 'Sin descripcion'}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Precio</dt>
                <dd>{formatearPrecioProducto(producto.precio_producto)}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Stock</dt>
                <dd>{String(producto.stock_producto)}</dd>
              </div>
            </dl>
          </section>
          <section className="detalle-registro__seccion">
            <h4>Imagen y auditoria</h4>
            <dl className="detalle-registro__lista">
              <div className="detalle-registro__fila">
                <dt>Estado</dt>
                <dd>{formatearEstadoRegistro(producto.es_activo_producto)}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Bucket</dt>
                <dd>{producto.nombre_bucket_imagen_producto ?? 'Sin bucket'}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Ruta imagen</dt>
                <dd>{producto.ruta_imagen_producto ?? 'Sin ruta'}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>URL publica</dt>
                <dd>{producto.url_imagen_producto ?? 'Sin URL publica'}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Tipo MIME</dt>
                <dd>{producto.tipo_mime_imagen_producto ?? 'Sin tipo MIME'}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Tamano</dt>
                <dd>{formatearTamanoArchivo(producto.tamano_bytes_imagen_producto)}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Creado</dt>
                <dd>{formatearFechaDetalle(producto.created_at)}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Actualizado</dt>
                <dd>{formatearFechaDetalle(producto.updated_at)}</dd>
              </div>
              <div className="detalle-registro__fila">
                <dt>Archivado</dt>
                <dd>{formatearFechaSimpleDetalle(producto.deleted_at)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </ModalFormulario>
  );
}
