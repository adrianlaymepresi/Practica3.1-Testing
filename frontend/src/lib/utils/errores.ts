import { ApiError, ErrorCampo } from '@/src/types/api.types';

const ETIQUETAS_CAMPOS: Record<string, string> = {
  id_rol: 'Rol',
  nombre_rol: 'Nombre del rol',
  descripcion_rol: 'Descripcion del rol',
  id_empleado: 'Empleado',
  ci_empleado: 'CI del empleado',
  nombres_completo_empleado: 'Nombres del empleado',
  apellidos_completo_empleado: 'Apellidos del empleado',
  correo_electronico_empleado: 'Correo del empleado',
  fecha_nacimiento_empleado: 'Fecha de nacimiento',
  telefono_empleado: 'Telefono del empleado',
  id_usuario: 'Usuario',
  nombre_usuario: 'Nombre de usuario',
  contrasenia_usuario: 'Contrasenia',
  id_cliente: 'Cliente',
  ci_cliente: 'CI del cliente',
  nombres_completo_cliente: 'Nombres del cliente',
  apellidos_completo_cliente: 'Apellidos del cliente',
  telefono_cliente: 'Telefono del cliente',
  correo_electronico_cliente: 'Correo del cliente',
  direccion_cliente: 'Direccion del cliente',
  id_producto: 'Producto',
  codigo_producto: 'Codigo del producto',
  nombre_producto: 'Nombre del producto',
  descripcion_producto: 'Descripcion del producto',
  precio_producto: 'Precio del producto',
  stock_producto: 'Stock del producto',
  archivo: 'Imagen del producto',
  id_orden_pedido: 'Pedido',
  codigo_orden_pedido: 'Codigo del pedido',
  fecha_orden_pedido: 'Fecha del pedido',
  estado_orden_pedido: 'Estado del pedido',
  observacion_orden_pedido: 'Observacion del pedido',
  subtotal_orden_pedido: 'Subtotal del pedido',
  descuento_orden_pedido: 'Descuento del pedido',
  total_orden_pedido: 'Total del pedido',
  recibo: 'Recibo',
  id_detalle_orden: 'Detalle del pedido',
  cantidad_detalle_orden: 'Cantidad',
  precio_unitario_detalle_orden: 'Precio unitario',
  subtotal_detalle_orden: 'Subtotal del detalle',
};

function esErrorCampo(valor: unknown): valor is ErrorCampo {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const posibleError = valor as Record<string, unknown>;

  return (
    typeof posibleError.campo === 'string' &&
    Array.isArray(posibleError.mensajes) &&
    posibleError.mensajes.every((mensaje) => typeof mensaje === 'string')
  );
}

export function obtenerMensajeError(
  error: unknown,
  mensajeDefecto: string,
) {
  return error instanceof Error ? error.message : mensajeDefecto;
}

export function obtenerErroresCampo(error: unknown) {
  if (!(error instanceof ApiError) || !Array.isArray(error.errores)) {
    return [];
  }

  return error.errores.filter(esErrorCampo);
}

function capitalizarTexto(valor: string) {
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}

export function formatearCampoError(campo: string) {
  const partes = campo.split('.');

  return partes
    .map((parte) => {
      const etiqueta = ETIQUETAS_CAMPOS[parte];

      if (etiqueta) {
        return etiqueta;
      }

      return capitalizarTexto(parte.replace(/_/g, ' '));
    })
    .join(' / ');
}
