'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioRol } from '@/src/components/formularios/FormularioRol';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleRegistro } from '@/src/components/modales/ModalDetalleRegistro';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { TablaRoles } from '@/src/components/tablas/TablaRoles';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import { formatearEstadoRegistro } from '@/src/lib/utils/detalle-registro';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import {
  actualizarRol,
  archivarRol,
  crearRol,
  eliminarRol,
  listarRoles,
  reactivarRol,
} from '@/src/services/roles.service';
import { EstadoRegistro } from '@/src/types/api.types';
import {
  ActualizarRolPayload,
  CrearRolPayload,
  Rol,
} from '@/src/types/roles.types';

type AccionConfirmacion = 'archivar' | 'reactivar' | 'eliminar';

interface ConfirmacionPendiente {
  accion: AccionConfirmacion;
  rol: Rol;
}

export function RolesPageClient() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [rolEdicion, setRolEdicion] = useState<Rol | null>(null);
  const [rolDetalle, setRolDetalle] = useState<Rol | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('nombre_rol');
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>('activos');
  const erroresFormulario = useErroresFormulario();

  async function cargarRoles(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
    estadoActual = estadoRegistro,
  ) {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarRoles({
        pagina,
        limite: 10,
        busqueda: busquedaActual || undefined,
        campoBusqueda: campoBusquedaActual,
        estadoRegistro: estadoActual,
      });
      setRoles(respuesta.registros);
      setPaginacion(respuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener la lista de roles',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrear(datos: CrearRolPayload) {
    try {
      await crearRol(datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await cargarRoles(1);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(errorDesconocido, 'No se pudo crear el rol');
      throw errorDesconocido;
    }
  }

  async function manejarActualizar(idRol: string, datos: ActualizarRolPayload) {
    try {
      await actualizarRol(idRol, datos);
      erroresFormulario.limpiar();
      setRolEdicion(null);
      setModalFormularioAbierto(false);
      await cargarRoles(paginacion.pagina);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el rol',
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
        await archivarRol(confirmacion.rol.id_rol);
      }

      if (confirmacion.accion === 'reactivar') {
        await reactivarRol(confirmacion.rol.id_rol);
      }

      if (confirmacion.accion === 'eliminar') {
        await eliminarRol(confirmacion.rol.id_rol);
      }

      setConfirmacion(null);
      await cargarRoles(paginacion.pagina);
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
        const respuesta = await listarRoles({
          pagina: 1,
          limite: 10,
          campoBusqueda: 'nombre_rol',
          estadoRegistro: 'activos',
        });

        if (estaMontado) {
          setRoles(respuesta.registros);
          setPaginacion(respuesta.paginacion);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo obtener la lista de roles',
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
      titulo="Roles"
      descripcion="Gestiona el catalogo base de roles del sistema de pedidos."
      acciones={
        <>
          <Boton
            icono={<Plus size={17} />}
            onClick={() => {
              erroresFormulario.limpiar();
              setRolEdicion(null);
              setModalFormularioAbierto(true);
            }}
            type="button"
          >
            Nuevo rol
          </Boton>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={() => cargarRoles(paginacion.pagina)}
            type="button"
          >
            Actualizar
          </Boton>
        </>
      }
    >
      <BarraBusqueda
        opciones={[
          { valor: 'nombre_rol', etiqueta: 'Nombre' },
          { valor: 'descripcion_rol', etiqueta: 'Descripcion' },
        ]}
        campoInicial="nombre_rol"
        estadoInicial="activos"
        mostrarFiltroEstado
        placeholder="Buscar rol"
        alBuscar={(valor, campo, estado) => {
          const estadoActual = estado ?? 'activos';
          setBusqueda(valor);
          setCampoBusqueda(campo);
          setEstadoRegistro(estadoActual);
          void cargarRoles(1, valor, campo, estadoActual);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('nombre_rol');
          setEstadoRegistro('activos');
          void cargarRoles(1, '', 'nombre_rol', 'activos');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando roles" />
        ) : (
          <>
            <TablaRoles
              roles={roles}
              alVerDetalle={setRolDetalle}
              alEditar={(rol) => {
                erroresFormulario.limpiar();
                setRolEdicion(rol);
                setModalFormularioAbierto(true);
              }}
              alCambiarEstado={(rol) =>
                setConfirmacion({
                  accion: rol.es_activo_rol ? 'archivar' : 'reactivar',
                  rol,
                })
              }
              alEliminar={(rol) => setConfirmacion({ accion: 'eliminar', rol })}
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarRoles(pagina, busqueda, campoBusqueda, estadoRegistro)
              }
            />
          </>
        )}
      </section>
      <ModalFormulario
        abierto={modalFormularioAbierto}
        titulo={rolEdicion ? 'Editar rol' : 'Nuevo rol'}
        descripcion="Completa la informacion del rol."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setRolEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioRol
          key={rolEdicion?.id_rol ?? 'nuevo'}
          rolEdicion={rolEdicion}
          alCrear={manejarCrear}
          alActualizar={manejarActualizar}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setRolEdicion(null);
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
        abierto={Boolean(rolDetalle)}
        titulo={rolDetalle ? `Rol ${rolDetalle.nombre_rol}` : 'Detalle rol'}
        secciones={
          rolDetalle
            ? [
                {
                  titulo: 'Datos principales',
                  items: [
                    { etiqueta: 'Nombre', valor: rolDetalle.nombre_rol },
                    {
                      etiqueta: 'Descripcion',
                      valor: rolDetalle.descripcion_rol ?? 'Sin descripcion',
                    },
                    {
                      etiqueta: 'Estado',
                      valor: formatearEstadoRegistro(rolDetalle.es_activo_rol),
                    },
                  ],
                },
              ]
            : []
        }
        alCerrar={() => setRolDetalle(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.accion === 'archivar'
            ? 'Archivar rol'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar rol'
              : 'Eliminar rol'
        }
        mensaje={
          confirmacion?.accion === 'archivar'
            ? 'Seguro que deseas archivar este rol? Dejara de aparecer en la vista activa, pero se conservara el historial.'
            : confirmacion?.accion === 'reactivar'
              ? 'Seguro que deseas reactivar este rol? Volvera a mostrarse en la lista activa.'
              : 'Seguro que deseas eliminar este rol de forma permanente? La operacion se bloqueara si el rol tiene usuarios vinculados.'
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
