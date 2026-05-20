'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioCliente } from '@/src/components/formularios/FormularioCliente';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleRegistro } from '@/src/components/modales/ModalDetalleRegistro';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { TablaClientes } from '@/src/components/tablas/TablaClientes';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import {
  formatearEstadoRegistro,
} from '@/src/lib/utils/detalle-registro';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import {
  actualizarCliente,
  archivarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes,
  reactivarCliente,
} from '@/src/services/clientes.service';
import { EstadoRegistro } from '@/src/types/api.types';
import {
  ActualizarClientePayload,
  Cliente,
  CrearClientePayload,
} from '@/src/types/clientes.types';

type AccionConfirmacion = 'archivar' | 'reactivar' | 'eliminar';

interface ConfirmacionPendiente {
  accion: AccionConfirmacion;
  cliente: Cliente;
}

export function ClientesPageClient() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [clienteEdicion, setClienteEdicion] = useState<Cliente | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('ci_cliente');
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>('activos');
  const erroresFormulario = useErroresFormulario();

  async function cargarClientes(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
    estadoActual = estadoRegistro,
  ) {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarClientes({
        pagina,
        limite: 10,
        busqueda: busquedaActual || undefined,
        campoBusqueda: campoBusquedaActual,
        estadoRegistro: estadoActual,
      });
      setClientes(respuesta.registros);
      setPaginacion(respuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener la lista de clientes',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrear(datos: CrearClientePayload) {
    try {
      await crearCliente(datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await cargarClientes(1);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo crear el cliente',
      );
      throw errorDesconocido;
    }
  }

  async function manejarActualizar(
    idCliente: string,
    datos: ActualizarClientePayload,
  ) {
    try {
      await actualizarCliente(idCliente, datos);
      erroresFormulario.limpiar();
      setClienteEdicion(null);
      setModalFormularioAbierto(false);
      await cargarClientes(paginacion.pagina);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el cliente',
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
        await archivarCliente(confirmacion.cliente.id_cliente);
      }

      if (confirmacion.accion === 'reactivar') {
        await reactivarCliente(confirmacion.cliente.id_cliente);
      }

      if (confirmacion.accion === 'eliminar') {
        await eliminarCliente(confirmacion.cliente.id_cliente);
      }

      setConfirmacion(null);
      await cargarClientes(paginacion.pagina);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(errorDesconocido, 'No se pudo completar la accion'),
      );
    } finally {
      setProcesando(false);
    }
  }

  useEffect(() => {
    let estaMontado = true;

    async function cargarInicial() {
      try {
        const respuesta = await listarClientes({
          pagina: 1,
          limite: 10,
          campoBusqueda: 'ci_cliente',
          estadoRegistro: 'activos',
        });

        if (estaMontado) {
          setClientes(respuesta.registros);
          setPaginacion(respuesta.paginacion);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo obtener la lista de clientes',
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
      titulo="Clientes"
      descripcion="Gestiona la base de clientes que luego se vinculara con las ordenes de pedido."
      acciones={
        <>
          <Boton
            icono={<Plus size={17} />}
            onClick={() => {
              erroresFormulario.limpiar();
              setClienteEdicion(null);
              setModalFormularioAbierto(true);
            }}
            type="button"
          >
            Nuevo cliente
          </Boton>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={() => cargarClientes(paginacion.pagina)}
            type="button"
          >
            Actualizar
          </Boton>
        </>
      }
    >
      <BarraBusqueda
        opciones={[
          { valor: 'ci_cliente', etiqueta: 'CI' },
          { valor: 'nombres_completo_cliente', etiqueta: 'Nombres' },
          { valor: 'apellidos_completo_cliente', etiqueta: 'Apellidos' },
          { valor: 'telefono_cliente', etiqueta: 'Telefono' },
          { valor: 'correo_electronico_cliente', etiqueta: 'Correo' },
          { valor: 'direccion_cliente', etiqueta: 'Direccion' },
        ]}
        campoInicial="ci_cliente"
        estadoInicial="activos"
        mostrarFiltroEstado
        placeholder="Buscar cliente"
        alBuscar={(valor, campo, estado) => {
          const estadoActual = estado ?? 'activos';
          setBusqueda(valor);
          setCampoBusqueda(campo);
          setEstadoRegistro(estadoActual);
          void cargarClientes(1, valor, campo, estadoActual);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('ci_cliente');
          setEstadoRegistro('activos');
          void cargarClientes(1, '', 'ci_cliente', 'activos');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando clientes" />
        ) : (
          <>
            <TablaClientes
              clientes={clientes}
              alVerDetalle={setClienteDetalle}
              alEditar={(cliente) => {
                erroresFormulario.limpiar();
                setClienteEdicion(cliente);
                setModalFormularioAbierto(true);
              }}
              alCambiarEstado={(cliente) =>
                setConfirmacion({
                  accion: cliente.es_activo_cliente ? 'archivar' : 'reactivar',
                  cliente,
                })
              }
              alEliminar={(cliente) =>
                setConfirmacion({ accion: 'eliminar', cliente })
              }
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarClientes(
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
        titulo={clienteEdicion ? 'Editar cliente' : 'Nuevo cliente'}
        descripcion="Completa la informacion base del cliente."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setClienteEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioCliente
          key={clienteEdicion?.id_cliente ?? 'nuevo'}
          clienteEdicion={clienteEdicion}
          alCrear={manejarCrear}
          alActualizar={manejarActualizar}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setClienteEdicion(null);
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
      <ModalDetalleRegistro
        abierto={Boolean(clienteDetalle)}
        titulo={
          clienteDetalle
            ? `Cliente ${clienteDetalle.ci_cliente}`
            : 'Detalle cliente'
        }
        secciones={
          clienteDetalle
            ? [
                {
                  titulo: 'Datos principales',
                  items: [
                    { etiqueta: 'CI', valor: clienteDetalle.ci_cliente },
                    {
                      etiqueta: 'Nombres',
                      valor: clienteDetalle.nombres_completo_cliente,
                    },
                    {
                      etiqueta: 'Apellidos',
                      valor: clienteDetalle.apellidos_completo_cliente,
                    },
                    {
                      etiqueta: 'Telefono',
                      valor: clienteDetalle.telefono_cliente ?? 'Sin telefono',
                    },
                    {
                      etiqueta: 'Correo',
                      valor:
                        clienteDetalle.correo_electronico_cliente ?? 'Sin correo',
                    },
                    {
                      etiqueta: 'Direccion',
                      valor: clienteDetalle.direccion_cliente ?? 'Sin direccion',
                    },
                    {
                      etiqueta: 'Estado',
                      valor: formatearEstadoRegistro(
                        clienteDetalle.es_activo_cliente,
                      ),
                    },
                  ],
                },
              ]
            : []
        }
        alCerrar={() => setClienteDetalle(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.accion === 'archivar'
            ? 'Archivar cliente'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar cliente'
              : 'Eliminar cliente'
        }
        mensaje={
          confirmacion?.accion === 'archivar'
            ? 'Seguro que deseas archivar este cliente? Se conservara el historial pero dejara de aparecer en la vista activa.'
            : confirmacion?.accion === 'reactivar'
              ? 'Seguro que deseas reactivar este cliente? Volvera a estar disponible para las ordenes.'
              : 'Seguro que deseas eliminar este cliente de forma permanente? La operacion se bloqueara si el cliente tiene ordenes vinculadas.'
        }
        textoConfirmar={
          confirmacion?.accion === 'archivar'
            ? 'Archivar'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar'
              : 'Eliminar'
        }
        variante={
          confirmacion?.accion === 'eliminar' ? 'peligro' : 'secundario'
        }
        cargando={procesando}
        alCancelar={() => setConfirmacion(null)}
        alConfirmar={confirmarAccion}
      />
    </ContenedorPagina>
  );
}
