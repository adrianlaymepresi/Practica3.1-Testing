'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioPedido } from '@/src/components/formularios/FormularioPedido';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleRegistro } from '@/src/components/modales/ModalDetalleRegistro';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { TablaPedidos } from '@/src/components/tablas/TablaPedidos';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import {
  descargarReciboPedidoPdf,
  validarReciboPedido,
} from '@/src/lib/utils/pedido-pdf';
import { formatearEstadoRegistro } from '@/src/lib/utils/detalle-registro';
import {
  formatearFechaHoraZonaHoraria,
} from '@/src/lib/utils/fechas';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import {
  formatearMontoPedido,
  obtenerAccionEstadoPedido,
  obtenerNombreClientePedido,
  obtenerNombreEmpleadoPedido,
} from '@/src/lib/utils/pedidos';
import { listarClientesOpciones } from '@/src/services/clientes.service';
import { listarEmpleadosOpciones } from '@/src/services/empleados.service';
import {
  actualizarPedido,
  archivarPedido,
  cambiarEstadoPedido,
  crearPedido,
  eliminarPedido,
  listarPedidos,
  listarDetallesPedido,
  obtenerPedido,
  obtenerSiguienteCodigoPedido,
  reactivarPedido,
} from '@/src/services/pedidos.service';
import { EstadoRegistro } from '@/src/types/api.types';
import { ClienteOpcion } from '@/src/types/clientes.types';
import { EmpleadoOpcion } from '@/src/types/empleados.types';
import {
  ActualizarPedidoPayload,
  CrearPedidoPayload,
  Pedido,
} from '@/src/types/pedidos.types';
import { ErrorCampo } from '@/src/types/api.types';

type AccionConfirmacion =
  | 'archivar'
  | 'reactivar'
  | 'eliminar'
  | 'cancelar'
  | 'completar';

interface ConfirmacionPendiente {
  accion: AccionConfirmacion;
  pedido: Pedido;
}

export function PedidosPageClient() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<ClienteOpcion[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoOpcion[]>([]);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [pedidoEdicion, setPedidoEdicion] = useState<Pedido | null>(null);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [codigoSiguientePedido, setCodigoSiguientePedido] = useState('');
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('codigo_orden_pedido');
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>('activos');
  const [alertaRecibo, setAlertaRecibo] = useState<{
    mensaje: string;
    errores: ErrorCampo[];
  } | null>(null);
  const erroresFormulario = useErroresFormulario();

  async function cargarPedidos(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
    estadoActual = estadoRegistro,
  ) {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarPedidos({
        pagina,
        limite: 10,
        busqueda: busquedaActual || undefined,
        campoBusqueda: campoBusquedaActual,
        estadoRegistro: estadoActual,
      });
      setPedidos(respuesta.registros);
      setPaginacion(respuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener la lista de pedidos',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarCatalogos() {
    const [clientesRespuesta, empleadosRespuesta] = await Promise.all([
      listarClientesOpciones(),
      listarEmpleadosOpciones(),
    ]);

    setClientes(clientesRespuesta);
    setEmpleados(empleadosRespuesta);
  }

  async function cargarSiguienteCodigo() {
    const respuesta = await obtenerSiguienteCodigoPedido();
    setCodigoSiguientePedido(respuesta.codigo_orden_pedido);
  }

  async function manejarCrear(datos: CrearPedidoPayload) {
    try {
      await crearPedido(datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await cargarPedidos(1);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo crear el pedido',
      );
      throw errorDesconocido;
    }
  }

  async function manejarActualizar(
    idPedido: string,
    datos: ActualizarPedidoPayload,
  ) {
    try {
      await actualizarPedido(idPedido, datos);
      erroresFormulario.limpiar();
      setPedidoEdicion(null);
      setModalFormularioAbierto(false);
      await cargarPedidos(paginacion.pagina);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el pedido',
      );
      throw errorDesconocido;
    }
  }

  async function confirmarAccion() {
    if (!confirmacion) {
      return;
    }

    setProcesando(true);

    try {
      if (confirmacion.accion === 'archivar') {
        await archivarPedido(confirmacion.pedido.id_orden_pedido);
      }

      if (confirmacion.accion === 'reactivar') {
        await reactivarPedido(confirmacion.pedido.id_orden_pedido);
      }

      if (confirmacion.accion === 'eliminar') {
        await eliminarPedido(confirmacion.pedido.id_orden_pedido);
      }

      if (confirmacion.accion === 'cancelar') {
        await cambiarEstadoPedido(confirmacion.pedido.id_orden_pedido, {
          estado_orden_pedido: 'CANCELADO',
        });
      }

      if (confirmacion.accion === 'completar') {
        await cambiarEstadoPedido(confirmacion.pedido.id_orden_pedido, {
          estado_orden_pedido: 'COMPLETADO',
        });
      }

      setConfirmacion(null);
      await cargarPedidos(paginacion.pagina);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(errorDesconocido, 'No se pudo completar la accion'),
      );
    } finally {
      setProcesando(false);
    }
  }

  async function manejarDescargaRecibo(pedido: Pedido) {
    try {
      const [pedidoActualizado, detallesRespuesta] = await Promise.all([
        obtenerPedido(pedido.id_orden_pedido),
        listarDetallesPedido(pedido.id_orden_pedido, {
          pagina: 1,
          limite: 500,
          campoBusqueda: 'nombre_producto',
        }),
      ]);

      const erroresRecibo = validarReciboPedido(
        pedidoActualizado,
        detallesRespuesta.registros,
      );

      if (erroresRecibo.length > 0) {
        setAlertaRecibo({
          mensaje:
            'No se puede generar el recibo todavia. Revisa la informacion que falta en el pedido y sus detalles.',
          errores: erroresRecibo,
        });
        return;
      }

      descargarReciboPedidoPdf(
        pedidoActualizado,
        detallesRespuesta.registros,
      );
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
        const [pedidosRespuesta, clientesRespuesta, empleadosRespuesta] =
          await Promise.all([
            listarPedidos({
              pagina: 1,
              limite: 10,
              campoBusqueda: 'codigo_orden_pedido',
              estadoRegistro: 'activos',
            }),
            listarClientesOpciones(),
            listarEmpleadosOpciones(),
          ]);

        if (estaMontado) {
          setPedidos(pedidosRespuesta.registros);
          setPaginacion(pedidosRespuesta.paginacion);
          setClientes(clientesRespuesta);
          setEmpleados(empleadosRespuesta);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo obtener la lista de pedidos',
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
  }, []);

  return (
    <ContenedorPagina
      titulo="Pedidos"
      descripcion="Gestiona la cabecera del pedido y luego entra a cada registro para trabajar sus detalles."
      acciones={
        <>
          <Boton
            icono={<Plus size={17} />}
            onClick={async () => {
              try {
                erroresFormulario.limpiar();
                setPedidoEdicion(null);
                await cargarSiguienteCodigo();
                setModalFormularioAbierto(true);
              } catch (errorDesconocido) {
                setError(
                  obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo preparar el nuevo pedido',
                  ),
                );
              }
            }}
            type="button"
          >
            Nuevo pedido
          </Boton>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={async () => {
              await cargarCatalogos();
              await cargarPedidos(paginacion.pagina);
            }}
            type="button"
          >
            Actualizar
          </Boton>
        </>
      }
    >
      <BarraBusqueda
        opciones={[
          { valor: 'codigo_orden_pedido', etiqueta: 'Codigo' },
          { valor: 'cliente', etiqueta: 'Cliente' },
          { valor: 'ci_cliente', etiqueta: 'CI cliente' },
          { valor: 'empleado', etiqueta: 'Empleado' },
          { valor: 'ci_empleado', etiqueta: 'CI empleado' },
          { valor: 'estado_orden_pedido', etiqueta: 'Estado pedido' },
        ]}
        campoInicial="codigo_orden_pedido"
        estadoInicial="activos"
        mostrarFiltroEstado
        placeholder="Buscar pedido"
        alBuscar={(valor, campo, estado) => {
          const estadoActual = estado ?? 'activos';
          setBusqueda(valor);
          setCampoBusqueda(campo);
          setEstadoRegistro(estadoActual);
          void cargarPedidos(1, valor, campo, estadoActual);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('codigo_orden_pedido');
          setEstadoRegistro('activos');
          void cargarPedidos(1, '', 'codigo_orden_pedido', 'activos');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando pedidos" />
        ) : (
          <>
            <TablaPedidos
              pedidos={pedidos}
              alVerDetalle={setPedidoDetalle}
              alDescargarRecibo={(pedido) => void manejarDescargaRecibo(pedido)}
              alEditar={(pedido) => {
                erroresFormulario.limpiar();
                setPedidoEdicion(pedido);
                setModalFormularioAbierto(true);
              }}
              alGestionarEstadoPedido={(pedido) => {
                const accionEstado = obtenerAccionEstadoPedido(pedido);

                if (!accionEstado.habilitado || !accionEstado.estadoDestino) {
                  return;
                }

                setConfirmacion({
                  accion:
                    accionEstado.estadoDestino === 'CANCELADO'
                      ? 'cancelar'
                      : 'completar',
                  pedido,
                });
              }}
              alCambiarEstadoRegistro={(pedido) =>
                setConfirmacion({
                  accion: pedido.es_activo_orden_pedido
                    ? 'archivar'
                    : 'reactivar',
                  pedido,
                })
              }
              alEliminar={(pedido) =>
                setConfirmacion({ accion: 'eliminar', pedido })
              }
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarPedidos(
                  pagina,
                  busqueda,
                  campoBusqueda,
                  estadoRegistro,
                )
              }
            />
          </>
        )}
      </section>
      <ModalFormulario
        abierto={modalFormularioAbierto}
        titulo={pedidoEdicion ? 'Editar pedido' : 'Nuevo pedido'}
        descripcion="Registra la cabecera del pedido. Los productos se agregan despues desde la gestion de detalles."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setPedidoEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioPedido
          key={pedidoEdicion?.id_orden_pedido ?? 'nuevo'}
          pedidoEdicion={pedidoEdicion}
          codigoPedido={pedidoEdicion?.codigo_orden_pedido ?? codigoSiguientePedido}
          clientes={clientes}
          empleados={empleados}
          alCrear={manejarCrear}
          alActualizar={manejarActualizar}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setPedidoEdicion(null);
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
        abierto={Boolean(pedidoDetalle)}
        titulo={
          pedidoDetalle
            ? `Pedido ${pedidoDetalle.codigo_orden_pedido}`
            : 'Detalle pedido'
        }
        secciones={
          pedidoDetalle
            ? [
                {
                  titulo: 'Datos principales',
                  items: [
                    {
                      etiqueta: 'Codigo',
                      valor: pedidoDetalle.codigo_orden_pedido,
                    },
                    {
                      etiqueta: 'Cliente',
                      valor: obtenerNombreClientePedido(pedidoDetalle.cliente),
                    },
                    {
                      etiqueta: 'Empleado',
                      valor: obtenerNombreEmpleadoPedido(pedidoDetalle.empleado),
                    },
                    {
                      etiqueta: 'Fecha',
                      valor: formatearFechaHoraZonaHoraria(
                        pedidoDetalle.fecha_orden_pedido,
                      ),
                    },
                    {
                      etiqueta: 'Estado del pedido',
                      valor: pedidoDetalle.estado_orden_pedido,
                    },
                    {
                      etiqueta: 'Observacion',
                      valor:
                        pedidoDetalle.observacion_orden_pedido ??
                        'Sin observacion',
                    },
                    {
                      etiqueta: 'Descuento',
                      valor: formatearMontoPedido(
                        pedidoDetalle.descuento_orden_pedido,
                      ),
                    },
                    {
                      etiqueta: 'Subtotal',
                      valor: formatearMontoPedido(
                        pedidoDetalle.subtotal_orden_pedido,
                      ),
                    },
                    {
                      etiqueta: 'Total',
                      valor: formatearMontoPedido(
                        pedidoDetalle.total_orden_pedido,
                      ),
                    },
                    {
                      etiqueta: 'Estado actual',
                      valor: formatearEstadoRegistro(
                        pedidoDetalle.es_activo_orden_pedido,
                      ),
                    },
                  ],
                },
              ]
            : []
        }
        alCerrar={() => setPedidoDetalle(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.accion === 'archivar'
            ? 'Archivar pedido'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar pedido'
              : confirmacion?.accion === 'cancelar'
                ? 'Cancelar pedido'
                : confirmacion?.accion === 'completar'
                  ? 'Completar pedido'
              : 'Eliminar pedido'
        }
        mensaje={
          confirmacion?.accion === 'archivar'
            ? 'Seguro que deseas archivar este pedido? Se conservara la cabecera y sus detalles, pero dejara de aparecer en la vista activa.'
            : confirmacion?.accion === 'reactivar'
              ? 'Seguro que deseas reactivar este pedido? Volvera a estar disponible para seguir gestionando su detalle.'
              : confirmacion?.accion === 'cancelar'
                ? 'Seguro que deseas cancelar este pedido? Se mantendra el historial y el stock de todos sus detalles se repondra.'
                : confirmacion?.accion === 'completar'
                  ? 'Seguro que deseas marcar este pedido como completado? El pedido quedara cerrado con la informacion actual.'
              : 'Seguro que deseas eliminar este pedido de forma permanente? La operacion se bloqueara si el pedido aun tiene detalles registrados.'
        }
        textoConfirmar={
          confirmacion?.accion === 'archivar'
            ? 'Archivar'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar'
              : confirmacion?.accion === 'cancelar'
                ? 'Cancelar pedido'
                : confirmacion?.accion === 'completar'
                  ? 'Completar pedido'
              : 'Eliminar'
        }
        variante={
          confirmacion?.accion === 'eliminar' ||
          confirmacion?.accion === 'cancelar'
            ? 'peligro'
            : 'secundario'
        }
        cargando={procesando}
        alCancelar={() => setConfirmacion(null)}
        alConfirmar={confirmarAccion}
      />
    </ContenedorPagina>
  );
}
