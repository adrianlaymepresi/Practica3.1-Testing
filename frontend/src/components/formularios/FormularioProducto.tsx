'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import {
  normalizarDecimalNoNegativo,
  normalizarEntero,
} from '@/src/lib/utils/formularios';
import {
  formatearTamanoArchivo,
  normalizarTextoProducto,
  validarArchivoProducto,
} from '@/src/lib/utils/productos';
import {
  ActualizarProductoPayload,
  CrearProductoPayload,
  Producto,
} from '@/src/types/productos.types';

interface FormularioProductoProps {
  productoEdicion?: Producto | null;
  alCrear: (datos: CrearProductoPayload) => Promise<void>;
  alActualizar: (
    idProducto: string,
    datos: ActualizarProductoPayload,
  ) => Promise<void>;
  alCancelarEdicion: () => void;
}

function obtenerInicial(producto?: Producto | null) {
  return {
    codigo_producto: producto?.codigo_producto ?? '',
    nombre_producto: producto?.nombre_producto ?? '',
    descripcion_producto: producto?.descripcion_producto ?? '',
    precio_producto:
      producto?.precio_producto !== undefined
        ? String(producto.precio_producto)
        : '',
    stock_producto:
      producto?.stock_producto !== undefined ? String(producto.stock_producto) : '',
    eliminar_imagen_actual: false,
  };
}

export function FormularioProducto({
  productoEdicion,
  alCrear,
  alActualizar,
  alCancelarEdicion,
}: FormularioProductoProps) {
  const [formulario, setFormulario] = useState(obtenerInicial(productoEdicion));
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(
    productoEdicion?.url_imagen_producto ?? null,
  );
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(productoEdicion);

  useEffect(() => {
    if (!archivo) {
      setVistaPrevia(
        formulario.eliminar_imagen_actual
          ? null
          : productoEdicion?.url_imagen_producto ?? null,
      );
      return;
    }

    const urlTemporal = URL.createObjectURL(archivo);
    setVistaPrevia(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [archivo, formulario.eliminar_imagen_actual, productoEdicion?.url_imagen_producto]);

  function manejarArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivoSeleccionado = evento.target.files?.[0] ?? null;

    if (!archivoSeleccionado) {
      setArchivo(null);
      setErrorArchivo(null);
      return;
    }

    const errorValidacion = validarArchivoProducto(archivoSeleccionado);

    if (errorValidacion) {
      setArchivo(null);
      setErrorArchivo(errorValidacion);
      evento.target.value = '';
      return;
    }

    setArchivo(archivoSeleccionado);
    setErrorArchivo(null);
    setFormulario((actual) => ({
      ...actual,
      eliminar_imagen_actual: false,
    }));
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      const datosBase = {
        codigo_producto: formulario.codigo_producto,
        nombre_producto: formulario.nombre_producto,
        descripcion_producto: formulario.descripcion_producto || undefined,
        precio_producto: formulario.precio_producto,
        stock_producto: formulario.stock_producto,
        archivo,
      };

      if (productoEdicion) {
        await alActualizar(productoEdicion.id_producto, {
          ...datosBase,
          eliminar_imagen_actual: formulario.eliminar_imagen_actual,
        });
        alCancelarEdicion();
      } else {
        await alCrear(datosBase);
        setFormulario(obtenerInicial());
        setArchivo(null);
        setErrorArchivo(null);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario formulario-grid" onSubmit={manejarEnvio}>
      <InputTexto
        etiqueta="Codigo del producto"
        ayuda="Obligatorio. Maximo 30 caracteres."
        name="codigo_producto"
        value={formulario.codigo_producto}
        minLength={2}
        maxLength={30}
        placeholder="PRD-001"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            codigo_producto: normalizarTextoProducto(evento.target.value, 30),
          }))
        }
      />
      <InputTexto
        etiqueta="Nombre del producto"
        ayuda="Obligatorio. Maximo 120 caracteres."
        name="nombre_producto"
        value={formulario.nombre_producto}
        minLength={3}
        maxLength={120}
        placeholder="TECLADO MECANICO"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            nombre_producto: normalizarTextoProducto(evento.target.value, 120),
          }))
        }
      />
      <InputTexto
        etiqueta="Precio"
        ayuda="Obligatorio. Usa hasta 2 decimales y no permitas valores negativos."
        name="precio_producto"
        value={formulario.precio_producto}
        inputMode="decimal"
        placeholder="150.50"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            precio_producto: normalizarDecimalNoNegativo(evento.target.value),
          }))
        }
      />
      <InputTexto
        etiqueta="Stock"
        ayuda="Obligatorio. Solo numeros enteros y no negativos."
        name="stock_producto"
        value={formulario.stock_producto}
        inputMode="numeric"
        placeholder="25"
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            stock_producto: normalizarEntero(evento.target.value),
          }))
        }
      />
      <InputTexto
        className="formulario__campo-completo"
        etiqueta="Descripcion"
        ayuda="Opcional. Maximo 300 caracteres."
        name="descripcion_producto"
        value={formulario.descripcion_producto}
        maxLength={300}
        placeholder="Descripcion comercial del producto"
        multilinea
        rows={4}
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            descripcion_producto: evento.target.value.slice(0, 300),
          }))
        }
      />

      <div className="producto-imagen-formulario">
        <div className="producto-imagen-formulario__vista">
          {vistaPrevia ? (
            <img
              src={vistaPrevia}
              alt="Vista previa del producto"
              className="producto-imagen-formulario__preview"
            />
          ) : (
            <div className="producto-imagen-formulario__placeholder">
              <ImagePlus size={28} aria-hidden="true" />
              <span>Sin imagen seleccionada</span>
            </div>
          )}
        </div>
        <div className="producto-imagen-formulario__contenido">
          <label className="campo">
            <span className="campo__etiqueta">
              Imagen del producto
              <small>Opcional</small>
            </span>
            <input
              className="campo__control"
              type="file"
              accept="image/*"
              onChange={manejarArchivo}
            />
            <span className="campo__ayuda">
              Opcional. Se acepta cualquier imagen valida y el limite es 1 MB.
            </span>
          </label>
          {archivo ? (
            <div className="producto-imagen-formulario__meta">
              <span>{archivo.name}</span>
              <span>{formatearTamanoArchivo(archivo.size)}</span>
              <span>{archivo.type || 'Sin tipo MIME'}</span>
            </div>
          ) : productoEdicion?.url_imagen_producto &&
            !formulario.eliminar_imagen_actual ? (
            <div className="producto-imagen-formulario__meta">
              <span>Imagen actual cargada</span>
              <span>
                {formatearTamanoArchivo(
                  productoEdicion.tamano_bytes_imagen_producto,
                )}
              </span>
              <span>
                {productoEdicion.tipo_mime_imagen_producto ?? 'Sin tipo MIME'}
              </span>
            </div>
          ) : null}
          {estaEditando && productoEdicion?.url_imagen_producto ? (
            <div className="producto-imagen-formulario__acciones">
              <Boton
                variante={
                  formulario.eliminar_imagen_actual ? 'secundario' : 'fantasma'
                }
                type="button"
                icono={<Trash2 size={16} />}
                onClick={() =>
                  setFormulario((actual) => ({
                    ...actual,
                    eliminar_imagen_actual: !actual.eliminar_imagen_actual,
                  }))
                }
              >
                {formulario.eliminar_imagen_actual
                  ? 'Conservar imagen'
                  : 'Quitar imagen actual'}
              </Boton>
            </div>
          ) : null}
          {errorArchivo ? <MensajeError mensaje={errorArchivo} /> : null}
        </div>
      </div>

      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
        >
          {estaEditando ? 'Guardar producto' : 'Crear producto'}
        </Boton>
        {estaEditando ? (
          <Boton
            variante="fantasma"
            type="button"
            icono={<X size={18} />}
            onClick={alCancelarEdicion}
          >
            Cancelar
          </Boton>
        ) : null}
      </div>
    </form>
  );
}
