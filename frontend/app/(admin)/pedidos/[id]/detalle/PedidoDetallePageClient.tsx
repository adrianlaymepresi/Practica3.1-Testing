'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileDown, Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioDetallePedido } from '@/src/components/formularios/FormularioDetallePedido';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleRegistro } from '@/src/components/modales/ModalDetalleRegistro';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { TablaDetallesPedido } from '@/src/components/tablas/TablaDetallesPedido';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import { formatearEstadoRegistro } from '@/src/lib/utils/detalle-registro';
import { formatearFechaHoraZonaHoraria } from '@/src/lib/utils/fechas';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import {
  descargarReciboPedidoPdf,
  validarReciboPedido,
} from '@/src/lib/utils/pedido-pdf';
import {
  esPedidoPendiente,
  formatearMontoPedido,
  obtenerNombreClientePedido,
  obtenerNombreEmpleadoPedido,
  obtenerNombreProductoPedido,
} from '@/src/lib/utils/pedidos';
import {
  actualizarDetallePedido,
  crearDetallePedido,
  eliminarDetallePedido,
  listarDetallesPedido,
  listarProductosDisponiblesPedido,
  obtenerPedido,
} from '@/src/services/pedidos.service';
import { ProductoOpcion } from '@/src/types/productos.types';
import {
  ActualizarDetallePedidoPayload,
  CrearDetallePedidoPayload,
  DetallePedido,
  Pedido,
} from '@/src/types/pedidos.types';
import { ErrorCampo } from '@/src/types/api.types';

export function PedidoDetallePageClient() {
  const parametros = useParams<{ id: string }>();
  const idPedido = String(parametros.id);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [productos, setProductos] = useState<ProductoOpcion[]>([]);
  const [detalleEdicion, setDetalleEdicion] = useState<DetallePedido | null>(null);
  const [detalleInfo, setDetalleInfo] = useState<DetallePedido | null>(null);
  const [detalleEliminacion, setDetalleEliminacion] =
    useState<DetallePedido | null>(null);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('nombre_producto');
  const [alertaRecibo, setAlertaRecibo] = useState<{
    mensaje: string;
    errores: ErrorCampo[];
  } | null>(null);
  const erroresFormulario = useErroresFormulario();

  const permiteEdicion = esPedidoPendiente(pedido);

  const resumenTarjetas = useMemo(
    () =>
      pedido
        ? [
            {
              etiqueta: 'Cliente',
              valor: obtenerNombreClientePedido(pedido.cliente),
            },
            {
              etiqueta: 'Empleado',
              valor: obtenerNombreEmpleadoPedido(pedido.empleado),
            },
            {
              etiqueta: 'Fecha',
              valor: formatearFechaHoraZonaHoraria(pedido.fecha_orden_pedido),
            },
            {
              etiqueta: 'Estado pedido',
              valor: pedido.estado_orden_pedido,
            },
            {
              etiqueta: 'Subtotal',
              valor: formatearMontoPedido(pedido.subtotal_orden_pedido),
            },
            {
              etiqueta: 'Descuento',
              valor: formatearMontoPedido(pedido.descuento_orden_pedido),
            },
            {
              etiqueta: 'Total',
              valor: formatearMontoPedido(pedido.total_orden_pedido),
            },
            {
              etiqueta: 'Estado actual',
              valor: formatearEstadoRegistro(pedido.es_activo_orden_pedido),
            },
          ]
        : [],
    [pedido],
  );

  async function cargarPedido() {
    const respuesta = await obtenerPedido(idPedido);
    setPedido(respuesta);
  }

  async function cargarProductosDisponibles(idDetalleActual?: string) {
    const respuesta = await listarProductosDisponiblesPedido(
      idPedido,
      idDetalleActual,
    );
    setProductos(respuesta);
  }

  async function cargarDetalles(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
  ) {
    setCargando(true);
    setError(null);

    try {
      const [pedidoRespuesta, detallesRespuesta] = await Promise.all([
        obtenerPedido(idPedido),
        listarDetallesPedido(idPedido, {
          pagina,
          limite: 10,
          busqueda: busquedaActual || undefined,
          campoBusqueda: campoBusquedaActual,
        }),
      ]);

      setPedido(pedidoRespuesta);
      setDetalles(detallesRespuesta.registros);
      setPaginacion(detallesRespuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener el detalle del pedido',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrearDetalle(datos: CrearDetallePedidoPayload) {
    try {
      await crearDetallePedido(idPedido, datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await Promise.all([cargarDetalles(1), cargarPedido(), cargarProductosDisponibles()]);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo crear el detalle del pedido',
      );
      throw errorDesconocido;
    }
  }

  async function manejarActualizarDetalle(
    idDetalle: string,
    datos: ActualizarDetallePedidoPayload,
  ) {
    try {
      await actualizarDetallePedido(idPedido, idDetalle, datos);
      erroresFormulario.limpiar();
      setDetalleEdicion(null);
      setModalFormularioAbierto(false);
      await Promise.all([
        cargarDetalles(paginacion.pagina),
        cargarPedido(),
        cargarProductosDisponibles(),
      ]);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el detalle del pedido',
      );
      throw errorDesconocido;
    }
  }

  async function confirmarEliminacionDetalle() {
    if (!detalleEliminacion) {
      return;
    }

    setProcesando(true);

    try {
      await eliminarDetallePedido(idPedido, detalleEliminacion.id_detalle_orden);
      setDetalleEliminacion(null);
      await Promise.all([
        cargarDetalles(paginacion.pagina),
        cargarPedido(),
        cargarProductosDisponibles(),
      ]);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(errorDesconocido, 'No se pudo eliminar el detalle'),
      );
    } finally {
      setProcesando(false);
    }
  }

  async function manejarDescargaRecibo() {
    if (!pedido) {
      return;
    }

    try {
      const detallesReporte = await listarDetallesPedido(idPedido, {
        pagina: 1,
        limite: 500,
        campoBusqueda: 'nombre_producto',
      });

      const erroresRecibo = validarReciboPedido(
        pedido,
        detallesReporte.registros,
      );

      if (erroresRecibo.length > 0) {
        setAlertaRecibo({
          mensaje:
            'No se puede generar el recibo todavia. Completa la informacion faltante del pedido antes de descargarlo.',
          errores: erroresRecibo,
        });
        return;
      }

      descargarReciboPedidoPdf(pedido, detallesReporte.registros);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo generar el recibo del pedido',
        ),
      );
    }
  }

  useEffect(() => {
    let estaMontado = true;

    async function cargarInicial() {
      try {
        const [pedidoRespuesta, detallesRespuesta, productosRespuesta] =
          await Promise.all([
            obtenerPedido(idPedido),
            listarDetallesPedido(idPedido, {
              pagina: 1,
              limite: 10,
              campoBusqueda: 'nombre_producto',
            }),
            listarProductosDisponiblesPedido(idPedido),
          ]);

        if (estaMontado) {
          setPedido(pedidoRespuesta);
          setDetalles(detallesRespuesta.registros);
          setPaginacion(detallesRespuesta.paginacion);
          setProductos(productosRespuesta);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo cargar la gestion del pedido',
            ),
          );
        }
      } finally {
        if (estaMontado) {
          setCargando(false);
        }
      }
    }

    void cargarInicial();

    return () => {
      estaMontado = false;
    };
  }, [idPedido]);

  return (
    <ContenedorPagina
      titulo={pedido ? `Detalle de ${pedido.codigo_orden_pedido}` : 'Detalle del pedido'}
      descripcion="Administra los productos del pedido. El backend recalcula importes y controla stock automaticamente."
      acciones={
        <>
          <Link className="boton boton--fantasma enlace-boton" href="/pedidos">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Volver a pedidos</span>
          </Link>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={async () => {
              await Promise.all([
                cargarProductosDisponibles(detalleEdicion?.id_detalle_orden),
                cargarDetalles(paginacion.pagina),
              ]);
            }}
            type="button"
          >
            Actualizar
          </Boton>
          <Boton
            variante="fantasma"
            icono={<FileDown size={17} />}
            onClick={() => void manejarDescargaRecibo()}
            type="button"
            disabled={!pedido}
          >
            Descargar recibo
          </Boton>
          <Boton
            icono={<Plus size={17} />}
            onClick={() => {
              erroresFormulario.limpiar();
              setDetalleEdicion(null);
              void cargarProductosDisponibles()
                .then(() => setModalFormularioAbierto(true))
                .catch((errorDesconocido) =>
                  setError(
                    obtenerMensajeError(
                      errorDesconocido,
                      'No se pudo preparar el formulario del detalle',
                    ),
                  ),
                );
            }}
            type="button"
            disabled={!permiteEdicion}
          >
            Nuevo detalle
          </Boton>
        </>
      }
    >
      {pedido ? (
        <section className="resumen-pedido">
          <div className="resumen-pedido__grid">
            {resumenTarjetas.map((tarjeta) => (
              <article className="resumen-pedido__tarjeta" key={tarjeta.etiqueta}>
                <span>{tarjeta.etiqueta}</span>
                <strong>{tarjeta.valor}</strong>
              </article>
            ))}
          </div>
          {pedido.observacion_orden_pedido ? (
            <div className="resumen-pedido__observacion">
              <strong>Observacion</strong>
              <p>{pedido.observacion_orden_pedido}</p>
            </div>
          ) : null}
        </section>
      ) : null}
      <BarraBusqueda
        opciones={[
          { valor: 'nombre_producto', etiqueta: 'Producto' },
          { valor: 'codigo_producto', etiqueta: 'Codigo' },
        ]}
        campoInicial="nombre_producto"
        placeholder="Buscar detalle por producto"
        alBuscar={(valor, campo) => {
          setBusqueda(valor);
          setCampoBusqueda(campo);
          void cargarDetalles(1, valor, campo);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('nombre_producto');
          void cargarDetalles(1, '', 'nombre_producto');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando detalle del pedido" />
        ) : (
          <>
            <TablaDetallesPedido
              detalles={detalles}
              permiteEdicion={permiteEdicion}
              alVerDetalle={setDetalleInfo}
              alEditar={(detalle) => {
                erroresFormulario.limpiar();
                void cargarProductosDisponibles(detalle.id_detalle_orden)
                  .then(() => {
                    setDetalleEdicion(detalle);
                    setModalFormularioAbierto(true);
                  })
                  .catch((errorDesconocido) =>
                    setError(
                      obtenerMensajeError(
                        errorDesconocido,
                        'No se pudo preparar la edicion del detalle',
                      ),
                    ),
                  );
              }}
              alEliminar={setDetalleEliminacion}
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarDetalles(pagina, busqueda, campoBusqueda)
              }
            />
          </>
        )}
      </section>
      <ModalFormulario
        abierto={modalFormularioAbierto}
        titulo={detalleEdicion ? 'Editar detalle' : 'Nuevo detalle'}
        descripcion="Selecciona un producto, ajusta la cantidad con el control de stock y deja que el backend recalcule importes y existencias."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setDetalleEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioDetallePedido
          key={detalleEdicion?.id_detalle_orden ?? 'nuevo'}
          detalleEdicion={detalleEdicion}
          productos={productos}
          alCrear={manejarCrearDetalle}
          alActualizar={manejarActualizarDetalle}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setDetalleEdicion(null);
            setModalFormularioAbierto(false);
          }}
        />
      </ModalFormulario>
      <ModalErroresFormulario
        abierto={erroresFormulario.abierto}
        mensaje={erroresFormulario.mensaje}
        errores={erroresFormulario.errores}
        alCerrar={erroresFormulario.limpiar}
      />
      <ModalErroresFormulario
        abierto={Boolean(alertaRecibo)}
        mensaje={alertaRecibo?.mensaje}
        errores={alertaRecibo?.errores ?? []}
        alCerrar={() => setAlertaRecibo(null)}
      />
      <ModalDetalleRegistro
        abierto={Boolean(detalleInfo)}
        titulo={
          detalleInfo
            ? `Detalle ${obtenerNombreProductoPedido(detalleInfo.producto)}`
            : 'Detalle del pedido'
        }
        secciones={
          detalleInfo
            ? [
                {
                  titulo: 'Datos principales',
                  items: [
                    {
                      etiqueta: 'Producto',
                      valor: obtenerNombreProductoPedido(detalleInfo.producto),
                    },
                    {
                      etiqueta: 'Cantidad',
                      valor: String(detalleInfo.cantidad_detalle_orden),
                    },
                    {
                      etiqueta: 'Precio unitario',
                      valor: formatearMontoPedido(
                        detalleInfo.precio_unitario_detalle_orden,
                      ),
                    },
                    {
                      etiqueta: 'Subtotal',
                      valor: formatearMontoPedido(
                        detalleInfo.subtotal_detalle_orden,
                      ),
                    },
                  ],
                },
              ]
            : []
        }
        alCerrar={() => setDetalleInfo(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(detalleEliminacion)}
        titulo="Eliminar detalle del pedido"
        mensaje="Seguro que deseas eliminar este detalle? Se recalculara el total del pedido y el stock del producto se repondra."
        textoConfirmar="Eliminar"
        variante="peligro"
        cargando={procesando}
        alCancelar={() => setDetalleEliminacion(null)}
        alConfirmar={confirmarEliminacionDetalle}
      />
    </ContenedorPagina>
  );
}
