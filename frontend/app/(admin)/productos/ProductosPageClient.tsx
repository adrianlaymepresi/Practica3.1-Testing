'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { BarraBusqueda } from '@/src/components/comunes/BarraBusqueda';
import { Boton } from '@/src/components/comunes/Boton';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { SpinnerCarga } from '@/src/components/comunes/SpinnerCarga';
import { FormularioProducto } from '@/src/components/formularios/FormularioProducto';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { ModalConfirmacion } from '@/src/components/modales/ModalConfirmacion';
import { ModalDetalleProducto } from '@/src/components/modales/ModalDetalleProducto';
import { ModalErroresFormulario } from '@/src/components/modales/ModalErroresFormulario';
import { ModalFormulario } from '@/src/components/modales/ModalFormulario';
import { Paginacion } from '@/src/components/paginacion/Paginacion';
import { GridProductos } from '@/src/components/productos/GridProductos';
import { useErroresFormulario } from '@/src/hooks/useErroresFormulario';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { crearPaginacionVacia } from '@/src/lib/utils/paginacion';
import {
  actualizarProducto,
  archivarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  reactivarProducto,
} from '@/src/services/productos.service';
import { EstadoRegistro } from '@/src/types/api.types';
import {
  ActualizarProductoPayload,
  CrearProductoPayload,
  Producto,
} from '@/src/types/productos.types';

type AccionConfirmacion = 'archivar' | 'reactivar' | 'eliminar';

interface ConfirmacionPendiente {
  accion: AccionConfirmacion;
  producto: Producto;
}

export function ProductosPageClient() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [paginacion, setPaginacion] = useState(crearPaginacionVacia());
  const [productoEdicion, setProductoEdicion] = useState<Producto | null>(null);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('nombre_producto');
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>('activos');
  const erroresFormulario = useErroresFormulario();

  async function cargarProductos(
    pagina = paginacion.pagina,
    busquedaActual = busqueda,
    campoBusquedaActual = campoBusqueda,
    estadoActual = estadoRegistro,
  ) {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarProductos({
        pagina,
        limite: 10,
        busqueda: busquedaActual || undefined,
        campoBusqueda: campoBusquedaActual,
        estadoRegistro: estadoActual,
      });
      setProductos(respuesta.registros);
      setPaginacion(respuesta.paginacion);
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo obtener la lista de productos',
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrear(datos: CrearProductoPayload) {
    try {
      await crearProducto(datos);
      erroresFormulario.limpiar();
      setModalFormularioAbierto(false);
      await cargarProductos(1);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo crear el producto',
      );
      throw errorDesconocido;
    }
  }

  async function manejarActualizar(
    idProducto: string,
    datos: ActualizarProductoPayload,
  ) {
    try {
      await actualizarProducto(idProducto, datos);
      erroresFormulario.limpiar();
      setProductoEdicion(null);
      setModalFormularioAbierto(false);
      await cargarProductos(paginacion.pagina);
    } catch (errorDesconocido) {
      erroresFormulario.mostrar(
        errorDesconocido,
        'No se pudo actualizar el producto',
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
        await archivarProducto(confirmacion.producto.id_producto);
      }

      if (confirmacion.accion === 'reactivar') {
        await reactivarProducto(confirmacion.producto.id_producto);
      }

      if (confirmacion.accion === 'eliminar') {
        await eliminarProducto(confirmacion.producto.id_producto);
      }

      setConfirmacion(null);
      await cargarProductos(paginacion.pagina);
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
        const respuesta = await listarProductos({
          pagina: 1,
          limite: 10,
          campoBusqueda: 'nombre_producto',
          estadoRegistro: 'activos',
        });

        if (estaMontado) {
          setProductos(respuesta.registros);
          setPaginacion(respuesta.paginacion);
          setError(null);
        }
      } catch (errorDesconocido) {
        if (estaMontado) {
          setError(
            obtenerMensajeError(
              errorDesconocido,
              'No se pudo obtener la lista de productos',
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
      titulo="Productos"
      descripcion="Gestiona el catalogo comercial con imagen, precio, stock y soporte de Supabase Storage."
      acciones={
        <>
          <Boton
            icono={<Plus size={17} />}
            onClick={() => {
              erroresFormulario.limpiar();
              setProductoEdicion(null);
              setModalFormularioAbierto(true);
            }}
            type="button"
          >
            Nuevo producto
          </Boton>
          <Boton
            variante="secundario"
            icono={<RefreshCcw size={17} />}
            onClick={() => cargarProductos(paginacion.pagina)}
            type="button"
          >
            Actualizar
          </Boton>
        </>
      }
    >
      <BarraBusqueda
        opciones={[
          { valor: 'nombre_producto', etiqueta: 'Nombre' },
          { valor: 'codigo_producto', etiqueta: 'Codigo' },
          { valor: 'descripcion_producto', etiqueta: 'Descripcion' },
        ]}
        campoInicial="nombre_producto"
        estadoInicial="activos"
        mostrarFiltroEstado
        placeholder="Buscar producto"
        alBuscar={(valor, campo, estado) => {
          const estadoActual = estado ?? 'activos';
          setBusqueda(valor);
          setCampoBusqueda(campo);
          setEstadoRegistro(estadoActual);
          void cargarProductos(1, valor, campo, estadoActual);
        }}
        alLimpiar={() => {
          setBusqueda('');
          setCampoBusqueda('nombre_producto');
          setEstadoRegistro('activos');
          void cargarProductos(1, '', 'nombre_producto', 'activos');
        }}
      />
      <section className="panel-tabla">
        {error ? <MensajeError mensaje={error} /> : null}
        {cargando ? (
          <SpinnerCarga texto="Cargando productos" />
        ) : (
          <>
            <GridProductos
              productos={productos}
              alVerDetalle={setProductoDetalle}
              alEditar={(producto) => {
                erroresFormulario.limpiar();
                setProductoEdicion(producto);
                setModalFormularioAbierto(true);
              }}
              alCambiarEstado={(producto) =>
                setConfirmacion({
                  accion: producto.es_activo_producto ? 'archivar' : 'reactivar',
                  producto,
                })
              }
              alEliminar={(producto) =>
                setConfirmacion({ accion: 'eliminar', producto })
              }
            />
            <Paginacion
              paginacion={paginacion}
              alCambiarPagina={(pagina) =>
                void cargarProductos(
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
        titulo={productoEdicion ? 'Editar producto' : 'Nuevo producto'}
        descripcion="Completa la informacion comercial y, si deseas, registra una sola imagen del producto."
        alCerrar={() => {
          erroresFormulario.limpiar();
          setProductoEdicion(null);
          setModalFormularioAbierto(false);
        }}
      >
        <FormularioProducto
          key={productoEdicion?.id_producto ?? 'nuevo'}
          productoEdicion={productoEdicion}
          alCrear={manejarCrear}
          alActualizar={manejarActualizar}
          alCancelarEdicion={() => {
            erroresFormulario.limpiar();
            setProductoEdicion(null);
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
      <ModalDetalleProducto
        producto={productoDetalle}
        alCerrar={() => setProductoDetalle(null)}
      />
      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.accion === 'archivar'
            ? 'Archivar producto'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar producto'
              : 'Eliminar producto'
        }
        mensaje={
          confirmacion?.accion === 'archivar'
            ? 'Seguro que deseas archivar este producto? Se conservara el historial pero dejara de aparecer en la vista activa.'
            : confirmacion?.accion === 'reactivar'
              ? 'Seguro que deseas reactivar este producto? Volvera a mostrarse en el catalogo activo.'
              : 'Seguro que deseas eliminar este producto de forma permanente? La operacion se bloqueara si el producto ya esta vinculado a detalles de orden.'
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
