'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioEmpleado } from '@/src/components/formularios/FormularioEmpleado';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleRegistro } from '@/src/components/modales/ModalDetalleRegistro';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { TablaEmpleados } from '@/src/components/tablas/TablaEmpleados';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import {
  formatearEstadoRegistro,
  formatearFechaDetalle,
  formatearFechaSimpleDetalle,
} from '@/src/lib/utils/detalle-registro';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import {
  actualizarEmpleado,
  archivarEmpleado,
  crearEmpleado,
  eliminarEmpleado,
  listarEmpleados,
  reactivarEmpleado,
} from '@/src/services/empleados.service';
import { EstadoRegistro } from '@/src/types/api.types';
import {
  ActualizarEmpleadoPayload,
  CrearEmpleadoPayload,
  Empleado,
} from '@/src/types/empleados.types';

type AccionConfirmacion = 'archivar' | 'reactivar' | 'eliminar';

interface ConfirmacionPendiente {
  accion: AccionConfirmacion;
  empleado: Empleado;
}

export function EmpleadosPageClient() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [empleadoEdicion, setEmpleadoEdicion] = useState<Empleado | null>(null);
  const [empleadoDetalle, setEmpleadoDetalle] = useState<Empleado | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('ci_empleado');
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>('activos');
  const erroresFormulario = useErroresFormulario();

  async function cargarEmpleados(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
    estadoActual = estadoRegistro,
  ) {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarEmpleados({
        pagina,
        limite: 10,
        busqueda: busquedaActual || undefined,
        campoBusqueda: campoBusquedaActual,
        estadoRegistro: estadoActual,
      });
      setEmpleados(respuesta.registros);
      setPaginacion(respuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener la lista de empleados',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrear(datos: CrearEmpleadoPayload) {
    try {
      await crearEmpleado(datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await cargarEmpleados(1);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo crear el empleado',
      );
      throw errorDesconocido;
    }
  }

  async function manejarActualizar(
    idEmpleado: string,
    datos: ActualizarEmpleadoPayload,
  ) {
    try {
      await actualizarEmpleado(idEmpleado, datos);
      erroresFormulario.limpiar();
      setEmpleadoEdicion(null);
      setModalFormularioAbierto(false);
      await cargarEmpleados(paginacion.pagina);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el empleado',
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
        await archivarEmpleado(confirmacion.empleado.id_empleado);
      }

      if (confirmacion.accion === 'reactivar') {
        await reactivarEmpleado(confirmacion.empleado.id_empleado);
      }

      if (confirmacion.accion === 'eliminar') {
        await eliminarEmpleado(confirmacion.empleado.id_empleado);
      }

      setConfirmacion(null);
      await cargarEmpleados(paginacion.pagina);
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
        const respuesta = await listarEmpleados({
          pagina: 1,
          limite: 10,
          campoBusqueda: 'ci_empleado',
          estadoRegistro: 'activos',
        });

        if (estaMontado) {
          setEmpleados(respuesta.registros);
          setPaginacion(respuesta.paginacion);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo obtener la lista de empleados',
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
      titulo="Empleados"
      descripcion="Gestiona el personal base del sistema y prepara la asignacion de usuarios y pedidos."
      acciones={
        <>
          <Boton
            icono={<Plus size={17} />}
            onClick={() => {
              erroresFormulario.limpiar();
              setEmpleadoEdicion(null);
              setModalFormularioAbierto(true);
            }}
            type="button"
          >
            Nuevo empleado
          </Boton>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={() => cargarEmpleados(paginacion.pagina)}
            type="button"
          >
            Actualizar
          </Boton>
        </>
      }
    >
      <BarraBusqueda
        opciones={[
          { valor: 'ci_empleado', etiqueta: 'CI' },
          { valor: 'nombres_completo_empleado', etiqueta: 'Nombres' },
          { valor: 'apellidos_completo_empleado', etiqueta: 'Apellidos' },
          { valor: 'correo_electronico_empleado', etiqueta: 'Correo' },
        ]}
        campoInicial="ci_empleado"
        estadoInicial="activos"
        mostrarFiltroEstado
        placeholder="Buscar empleado"
        alBuscar={(valor, campo, estado) => {
          const estadoActual = estado ?? 'activos';
          setBusqueda(valor);
          setCampoBusqueda(campo);
          setEstadoRegistro(estadoActual);
          void cargarEmpleados(1, valor, campo, estadoActual);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('ci_empleado');
          setEstadoRegistro('activos');
          void cargarEmpleados(1, '', 'ci_empleado', 'activos');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando empleados" />
        ) : (
          <>
            <TablaEmpleados
              empleados={empleados}
              alVerDetalle={setEmpleadoDetalle}
              alEditar={(empleado) => {
                erroresFormulario.limpiar();
                setEmpleadoEdicion(empleado);
                setModalFormularioAbierto(true);
              }}
              alCambiarEstado={(empleado) =>
                setConfirmacion({
                  accion: empleado.es_activo_empleado ? 'archivar' : 'reactivar',
                  empleado,
                })
              }
              alEliminar={(empleado) =>
                setConfirmacion({ accion: 'eliminar', empleado })
              }
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarEmpleados(
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
        titulo={empleadoEdicion ? 'Editar empleado' : 'Nuevo empleado'}
        descripcion="Completa la informacion base del empleado."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setEmpleadoEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioEmpleado
          key={empleadoEdicion?.id_empleado ?? 'nuevo'}
          empleadoEdicion={empleadoEdicion}
          alCrear={manejarCrear}
          alActualizar={manejarActualizar}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setEmpleadoEdicion(null);
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
        abierto={Boolean(empleadoDetalle)}
        titulo={
          empleadoDetalle
            ? `Empleado ${empleadoDetalle.ci_empleado}`
            : 'Detalle empleado'
        }
        secciones={
          empleadoDetalle
            ? [
                {
                  titulo: 'Datos principales',
                  items: [
                    { etiqueta: 'UUID', valor: empleadoDetalle.id_empleado },
                    { etiqueta: 'CI', valor: empleadoDetalle.ci_empleado },
                    {
                      etiqueta: 'Nombres',
                      valor: empleadoDetalle.nombres_completo_empleado,
                    },
                    {
                      etiqueta: 'Apellidos',
                      valor: empleadoDetalle.apellidos_completo_empleado,
                    },
                    {
                      etiqueta: 'Correo',
                      valor: empleadoDetalle.correo_electronico_empleado,
                    },
                    {
                      etiqueta: 'Telefono',
                      valor: empleadoDetalle.telefono_empleado ?? 'Sin telefono',
                    },
                    {
                      etiqueta: 'Fecha de nacimiento',
                      valor: formatearFechaSimpleDetalle(
                        empleadoDetalle.fecha_nacimiento_empleado,
                      ),
                    },
                  ],
                },
                {
                  titulo: 'Estado y auditoria',
                  items: [
                    {
                      etiqueta: 'Estado',
                      valor: formatearEstadoRegistro(
                        empleadoDetalle.es_activo_empleado,
                      ),
                    },
                    {
                      etiqueta: 'Creado',
                      valor: formatearFechaDetalle(empleadoDetalle.created_at),
                    },
                    {
                      etiqueta: 'Actualizado',
                      valor: formatearFechaDetalle(empleadoDetalle.updated_at),
                    },
                    {
                      etiqueta: 'Archivado',
                      valor: formatearFechaSimpleDetalle(
                        empleadoDetalle.deleted_at,
                      ),
                    },
                  ],
                },
              ]
            : []
        }
        alCerrar={() => setEmpleadoDetalle(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.accion === 'archivar'
            ? 'Archivar empleado'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar empleado'
              : 'Eliminar empleado'
        }
        mensaje={
          confirmacion?.accion === 'archivar'
            ? 'Seguro que deseas archivar este empleado? Se conservara el historial pero dejara de aparecer en la vista activa.'
            : confirmacion?.accion === 'reactivar'
              ? 'Seguro que deseas reactivar este empleado? Volvera a estar disponible para usuarios y pedidos.'
              : 'Seguro que deseas eliminar este empleado de forma permanente? La operacion se bloqueara si tiene usuarios u ordenes vinculadas.'
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
