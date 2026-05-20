'use client';

import { ImageOff } from 'lucide-react';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { formatearEstadoRegistro } from '@/src/lib/utils/detalle-registro';
import { formatearPrecioProducto } from '@/src/lib/utils/productos';
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
              <div className="detalle-registro__fila">
                <dt>Estado</dt>
                <dd>{formatearEstadoRegistro(producto.es_activo_producto)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </ModalFormulario>
  );
}
