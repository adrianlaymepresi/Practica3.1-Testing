'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import { normalizarEntero } from '@/src/lib/utils/formularios';
import {
  formatearMontoPedido,
  obtenerNombreProductoPedido,
} from '@/src/lib/utils/pedidos';
import { ProductoOpcion } from '@/src/types/productos.types';
import {
  ActualizarDetallePedidoPayload,
  CrearDetallePedidoPayload,
  DetallePedido,
} from '@/src/types/pedidos.types';

interface FormularioDetallePedidoProps {
  detalleEdicion?: DetallePedido | null;
  productos: ProductoOpcion[];
  alCrear: (datos: CrearDetallePedidoPayload) => Promise<void>;
  alActualizar: (
    idDetalle: string,
    datos: ActualizarDetallePedidoPayload,
  ) => Promise<void>;
  alCancelarEdicion: () => void;
}

function obtenerInicial(detalle?: DetallePedido | null) {
  return {
    id_producto: detalle?.id_producto ?? '',
    cantidad_detalle_orden:
      detalle?.cantidad_detalle_orden !== undefined
        ? String(detalle.cantidad_detalle_orden)
        : '1',
  };
}

export function FormularioDetallePedido({
  detalleEdicion,
  productos,
  alCrear,
  alActualizar,
  alCancelarEdicion,
}: FormularioDetallePedidoProps) {
  const [formulario, setFormulario] = useState(obtenerInicial(detalleEdicion));
  const [enviando, setEnviando] = useState(false);
  const estaEditando = Boolean(detalleEdicion);

  const productosDisponibles = useMemo(() => {
    if (!detalleEdicion?.producto) {
      return productos;
    }

    const existe = productos.some(
      (producto) => producto.id_producto === detalleEdicion.id_producto,
    );

    if (existe) {
      return productos;
    }

    return [detalleEdicion.producto, ...productos];
  }, [detalleEdicion, productos]);

  const productoSeleccionado = useMemo(
    () =>
      productosDisponibles.find(
        (producto) => producto.id_producto === formulario.id_producto,
      ) ?? null,
    [formulario.id_producto, productosDisponibles],
  );

  const stockMaximoPermitido = useMemo(() => {
    if (!productoSeleccionado) {
      return 1;
    }

    const stockActual = Number(productoSeleccionado.stock_producto);

    if (
      detalleEdicion &&
      detalleEdicion.id_producto === productoSeleccionado.id_producto
    ) {
      return Math.max(1, stockActual + detalleEdicion.cantidad_detalle_orden);
    }

    return Math.max(1, stockActual);
  }, [detalleEdicion, productoSeleccionado]);

  const cantidadSeleccionada = Math.max(
    1,
    Math.min(
      Number(formulario.cantidad_detalle_orden || '1') || 1,
      stockMaximoPermitido,
    ),
  );
  const subtotalEstimado = productoSeleccionado
    ? Number(productoSeleccionado.precio_producto) * cantidadSeleccionada
    : 0;

  useEffect(() => {
    if (!formulario.id_producto) {
      return;
    }

    const cantidadNormalizada = String(cantidadSeleccionada);

    if (cantidadNormalizada !== formulario.cantidad_detalle_orden) {
      setFormulario((actual) => ({
        ...actual,
        cantidad_detalle_orden: cantidadNormalizada,
      }));
    }
  }, [
    cantidadSeleccionada,
    formulario.cantidad_detalle_orden,
    formulario.id_producto,
  ]);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      const datos = {
        id_producto: formulario.id_producto,
        cantidad_detalle_orden: String(cantidadSeleccionada),
      };

      if (detalleEdicion) {
        await alActualizar(detalleEdicion.id_detalle_orden, datos);
        alCancelarEdicion();
      } else {
        await alCrear(datos);
        setFormulario(obtenerInicial());
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario formulario-grid" onSubmit={manejarEnvio}>
      <label className="campo">
        <span className="campo__etiqueta">
          Producto
          <small>Obligatorio</small>
        </span>
        <select
          className="campo__control"
          value={formulario.id_producto}
          required
          onChange={(evento) =>
            setFormulario((actual) => ({
              ...actual,
              id_producto: evento.target.value,
            }))
          }
        >
          <option value="">Selecciona un producto</option>
          {productosDisponibles.map((producto) => (
            <option key={producto.id_producto} value={producto.id_producto}>
              {obtenerNombreProductoPedido(producto)}
            </option>
          ))}
        </select>
        <span className="campo__ayuda">
          Obligatorio. Solo se muestran productos activos con stock disponible.
        </span>
      </label>
      <InputTexto
        etiqueta="Cantidad"
        ayuda={`Obligatorio. Solo numeros enteros positivos entre 1 y ${stockMaximoPermitido}.`}
        name="cantidad_detalle_orden"
        type="number"
        value={formulario.cantidad_detalle_orden}
        inputMode="numeric"
        placeholder="1"
        min={1}
        max={stockMaximoPermitido}
        required
        onChange={(evento) =>
          setFormulario((actual) => ({
            ...actual,
            cantidad_detalle_orden: normalizarEntero(evento.target.value),
          }))
        }
      />
      <label className="campo formulario__campo-completo">
        <span className="campo__etiqueta">
          Control de cantidad
          <small>Obligatorio</small>
        </span>
        <div className="campo-rango">
          <input
            className="campo-rango__control"
            type="range"
            min={1}
            max={stockMaximoPermitido}
            step={1}
            value={cantidadSeleccionada}
            disabled={!productoSeleccionado}
            onChange={(evento) =>
              setFormulario((actual) => ({
                ...actual,
                cantidad_detalle_orden: evento.target.value,
              }))
            }
          />
          <div className="campo-rango__extremos">
            <span>1</span>
            <span>{stockMaximoPermitido}</span>
          </div>
        </div>
        <span className="campo__ayuda">
          Mueve el control entre 1 y {stockMaximoPermitido} segun el stock
          disponible para este producto.
        </span>
      </label>
      <div className="pedido-resumen-formulario pedido-resumen-formulario--detalle formulario__campo-completo">
        <div className="pedido-resumen-formulario__tarjeta">
          <span>Precio unitario actual</span>
          <strong>
            {productoSeleccionado
              ? formatearMontoPedido(Number(productoSeleccionado.precio_producto))
              : 'Sin dato'}
          </strong>
        </div>
        <div className="pedido-resumen-formulario__tarjeta">
          <span>Stock disponible</span>
          <strong>{productoSeleccionado ? String(stockMaximoPermitido) : 'Sin dato'}</strong>
        </div>
        <div className="pedido-resumen-formulario__tarjeta">
          <span>Subtotal estimado</span>
          <strong>{formatearMontoPedido(subtotalEstimado)}</strong>
        </div>
      </div>
      <div className="formulario__acciones">
        <Boton
          type="submit"
          icono={estaEditando ? <Pencil size={18} /> : <Plus size={18} />}
          cargando={enviando}
        >
          {estaEditando ? 'Guardar detalle' : 'Agregar detalle'}
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
