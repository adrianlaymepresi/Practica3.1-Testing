'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioUsuario } from '@/src/components/formularios/FormularioUsuario';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleRegistro } from '@/src/components/modales/ModalDetalleRegistro';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { TablaUsuarios } from '@/src/components/tablas/TablaUsuarios';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import {
  formatearEstadoRegistro,
  formatearFechaDetalle,
  formatearFechaSimpleDetalle,
} from '@/src/lib/utils/detalle-registro';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import { listarEmpleadosOpciones } from '@/src/services/empleados.service';
import { listarRolesOpciones } from '@/src/services/roles.service';
import {
  actualizarUsuario,
  archivarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  reactivarUsuario,
} from '@/src/services/usuarios.service';
import { EstadoRegistro } from '@/src/types/api.types';
import { EmpleadoOpcion } from '@/src/types/empleados.types';
import { RolOpcion } from '@/src/types/roles.types';
import {
  ActualizarUsuarioPayload,
  CrearUsuarioPayload,
  Usuario,
} from '@/src/types/usuarios.types';

type AccionConfirmacion = 'archivar' | 'reactivar' | 'eliminar';

interface ConfirmacionPendiente {
  accion: AccionConfirmacion;
  usuario: Usuario;
}

export function UsuariosPageClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<RolOpcion[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoOpcion[]>([]);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [usuarioEdicion, setUsuarioEdicion] = useState<Usuario | null>(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState<Usuario | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('nombre_usuario');
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>('activos');
  const erroresFormulario = useErroresFormulario();

  async function cargarUsuarios(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
    estadoActual = estadoRegistro,
  ) {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarUsuarios({
        pagina,
        limite: 10,
        busqueda: busquedaActual || undefined,
        campoBusqueda: campoBusquedaActual,
        estadoRegistro: estadoActual,
      });
      setUsuarios(respuesta.registros);
      setPaginacion(respuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener la lista de usuarios',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarCatalogos() {
    const [rolesRespuesta, empleadosRespuesta] = await Promise.all([
      listarRolesOpciones(),
      listarEmpleadosOpciones(),
    ]);

    setRoles(rolesRespuesta);
    setEmpleados(empleadosRespuesta);
  }

  async function manejarCrear(datos: CrearUsuarioPayload) {
    try {
      await crearUsuario(datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await cargarUsuarios(1);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo crear el usuario',
      );
      throw errorDesconocido;
    }
  }

  async function manejarActualizar(
    idUsuario: string,
    datos: ActualizarUsuarioPayload,
  ) {
    try {
      await actualizarUsuario(idUsuario, datos);
      erroresFormulario.limpiar();
      setUsuarioEdicion(null);
      setModalFormularioAbierto(false);
      await cargarUsuarios(paginacion.pagina);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el usuario',
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
        await archivarUsuario(confirmacion.usuario.id_usuario);
      }

      if (confirmacion.accion === 'reactivar') {
        await reactivarUsuario(confirmacion.usuario.id_usuario);
      }

      if (confirmacion.accion === 'eliminar') {
        await eliminarUsuario(confirmacion.usuario.id_usuario);
      }

      setConfirmacion(null);
      await cargarUsuarios(paginacion.pagina);
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
        const [usuariosRespuesta, rolesRespuesta, empleadosRespuesta] =
          await Promise.all([
            listarUsuarios({
              pagina: 1,
              limite: 10,
              campoBusqueda: 'nombre_usuario',
              estadoRegistro: 'activos',
            }),
            listarRolesOpciones(),
            listarEmpleadosOpciones(),
          ]);

        if (estaMontado) {
          setUsuarios(usuariosRespuesta.registros);
          setPaginacion(usuariosRespuesta.paginacion);
          setRoles(rolesRespuesta);
          setEmpleados(empleadosRespuesta);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo obtener la lista de usuarios',
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
      titulo="Usuarios"
      descripcion="Gestiona los accesos internos del panel asignando un empleado y un rol activo."
      acciones={
        <>
          <Boton
            icono={<Plus size={17} />}
            onClick={() => {
              erroresFormulario.limpiar();
              setUsuarioEdicion(null);
              setModalFormularioAbierto(true);
            }}
            type="button"
          >
            Nuevo usuario
          </Boton>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={async () => {
              await cargarCatalogos();
              await cargarUsuarios(paginacion.pagina);
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
          { valor: 'nombre_usuario', etiqueta: 'Usuario' },
          { valor: 'empleado', etiqueta: 'Empleado' },
          { valor: 'ci_empleado', etiqueta: 'CI empleado' },
          { valor: 'nombre_rol', etiqueta: 'Rol' },
        ]}
        campoInicial="nombre_usuario"
        estadoInicial="activos"
        mostrarFiltroEstado
        placeholder="Buscar usuario"
        alBuscar={(valor, campo, estado) => {
          const estadoActual = estado ?? 'activos';
          setBusqueda(valor);
          setCampoBusqueda(campo);
          setEstadoRegistro(estadoActual);
          void cargarUsuarios(1, valor, campo, estadoActual);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('nombre_usuario');
          setEstadoRegistro('activos');
          void cargarUsuarios(1, '', 'nombre_usuario', 'activos');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando usuarios" />
        ) : (
          <>
            <TablaUsuarios
              usuarios={usuarios}
              alVerDetalle={setUsuarioDetalle}
              alEditar={(usuario) => {
                erroresFormulario.limpiar();
                setUsuarioEdicion(usuario);
                setModalFormularioAbierto(true);
              }}
              alCambiarEstado={(usuario) =>
                setConfirmacion({
                  accion: usuario.es_activo_usuario ? 'archivar' : 'reactivar',
                  usuario,
                })
              }
              alEliminar={(usuario) =>
                setConfirmacion({ accion: 'eliminar', usuario })
              }
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarUsuarios(pagina, busqueda, campoBusqueda, estadoRegistro)
              }
            />
          </>
        )}
      </section>
      <ModalFormulario
        abierto={modalFormularioAbierto}
        titulo={usuarioEdicion ? 'Editar usuario' : 'Nuevo usuario'}
        descripcion="Asigna un empleado activo, un rol y, si corresponde, actualiza la contrasenia."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setUsuarioEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioUsuario
          key={usuarioEdicion?.id_usuario ?? 'nuevo'}
          usuarioEdicion={usuarioEdicion}
          empleados={empleados}
          roles={roles}
          alCrear={manejarCrear}
          alActualizar={manejarActualizar}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setUsuarioEdicion(null);
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
        abierto={Boolean(usuarioDetalle)}
        titulo={
          usuarioDetalle
            ? `Usuario ${usuarioDetalle.nombre_usuario}`
            : 'Detalle usuario'
        }
        secciones={
          usuarioDetalle
            ? [
                {
                  titulo: 'Datos principales',
                  items: [
                    { etiqueta: 'UUID', valor: usuarioDetalle.id_usuario },
                    {
                      etiqueta: 'Usuario',
                      valor: usuarioDetalle.nombre_usuario,
                    },
                    {
                      etiqueta: 'Empleado',
                      valor: usuarioDetalle.empleado
                        ? `${usuarioDetalle.empleado.ci_empleado} - ${usuarioDetalle.empleado.nombres_completo_empleado} ${usuarioDetalle.empleado.apellidos_completo_empleado}`
                        : 'Sin empleado',
                    },
                    {
                      etiqueta: 'Rol',
                      valor: usuarioDetalle.rol?.nombre_rol ?? 'Sin rol',
                    },
                    {
                      etiqueta: 'Ultima sesion',
                      valor: formatearFechaDetalle(
                        usuarioDetalle.ultima_sesion_usuario,
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
                        usuarioDetalle.es_activo_usuario,
                      ),
                    },
                    {
                      etiqueta: 'Creado',
                      valor: formatearFechaDetalle(usuarioDetalle.created_at),
                    },
                    {
                      etiqueta: 'Actualizado',
                      valor: formatearFechaDetalle(usuarioDetalle.updated_at),
                    },
                    {
                      etiqueta: 'Archivado',
                      valor: formatearFechaSimpleDetalle(
                        usuarioDetalle.deleted_at,
                      ),
                    },
                  ],
                },
              ]
            : []
        }
        alCerrar={() => setUsuarioDetalle(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.accion === 'archivar'
            ? 'Archivar usuario'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar usuario'
              : 'Eliminar usuario'
        }
        mensaje={
          confirmacion?.accion === 'archivar'
            ? 'Seguro que deseas archivar este usuario? Dejara de aparecer en la vista activa.'
            : confirmacion?.accion === 'reactivar'
              ? 'Seguro que deseas reactivar este usuario? Volvera a estar disponible en el panel.'
              : 'Seguro que deseas eliminar este usuario de forma permanente? Esta accion no se puede deshacer.'
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
