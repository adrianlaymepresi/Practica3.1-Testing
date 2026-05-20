'use client';

import {
  Archive,
  Eye,
  ImageOff,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { formatearFechaSimpleZonaHoraria } from '@/src/lib/utils/fechas';
import {
  formatearPrecioProducto,
  formatearTamanoArchivo,
} from '@/src/lib/utils/productos';
import { Producto } from '@/src/types/productos.types';

interface GridProductosProps {
  productos: Producto[];
  alVerDetalle: (producto: Producto) => void;
  alEditar: (producto: Producto) => void;
  alCambiarEstado: (producto: Producto) => void;
  alEliminar: (producto: Producto) => void;
}

export function GridProductos({
  productos,
  alVerDetalle,
  alEditar,
  alCambiarEstado,
  alEliminar,
}: GridProductosProps) {
  if (productos.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>No hay productos registrados</strong>
        <span>Crea el primer producto con imagen para comenzar el catalogo.</span>
      </div>
    );
  }

  return (
    <div className="productos-grid">
      {productos.map((producto) => (
        <article className="producto-card" key={producto.id_producto}>
          <div className="producto-card__media">
            {producto.url_imagen_producto ? (
              <img
                src={producto.url_imagen_producto}
                alt={producto.nombre_producto}
                className="producto-card__imagen"
              />
            ) : (
              <div className="producto-card__placeholder">
                <ImageOff size={30} aria-hidden="true" />
                <span>Sin imagen</span>
              </div>
            )}
            <span
              className={`producto-card__estado ${
                producto.es_activo_producto
                  ? 'producto-card__estado--activo'
                  : 'producto-card__estado--inactivo'
              }`}
            >
              {producto.es_activo_producto ? 'Activo' : 'Archivado'}
            </span>
          </div>
          <div className="producto-card__contenido">
            <div className="producto-card__cabecera">
              <div>
                <span>{producto.codigo_producto}</span>
                <strong>{producto.nombre_producto}</strong>
              </div>
              <strong className="producto-card__precio">
                {formatearPrecioProducto(producto.precio_producto)}
              </strong>
            </div>
            <p>{producto.descripcion_producto ?? 'Sin descripcion comercial'}</p>
            <div className="producto-card__meta">
              <span>Stock: {producto.stock_producto}</span>
              <span>
                Imagen:{' '}
                {formatearTamanoArchivo(producto.tamano_bytes_imagen_producto)}
              </span>
              <span>
                Actualizado:{' '}
                {formatearFechaSimpleZonaHoraria(producto.updated_at)}
              </span>
            </div>
            <div className="producto-card__acciones">
              <Boton
                variante="fantasma"
                icono={<Eye size={16} />}
                onClick={() => alVerDetalle(producto)}
                type="button"
              >
                Ver info
              </Boton>
              <Boton
                variante="secundario"
                icono={<Pencil size={16} />}
                onClick={() => alEditar(producto)}
                type="button"
              >
                Editar
              </Boton>
              <Boton
                variante={
                  producto.es_activo_producto ? 'fantasma' : 'secundario'
                }
                icono={
                  producto.es_activo_producto ? (
                    <Archive size={16} />
                  ) : (
                    <RotateCcw size={16} />
                  )
                }
                onClick={() => alCambiarEstado(producto)}
                type="button"
              >
                {producto.es_activo_producto ? 'Archivar' : 'Reactivar'}
              </Boton>
              <Boton
                variante="peligro"
                icono={<Trash2 size={16} />}
                onClick={() => alEliminar(producto)}
                type="button"
              >
                Eliminar
              </Boton>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
