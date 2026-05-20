import { solicitarApi } from '@/src/lib/api/cliente-api';
import {
  ParametrosPaginacion,
  RespuestaPaginada,
} from '@/src/types/api.types';
import {
  ActualizarEmpleadoPayload,
  CrearEmpleadoPayload,
  Empleado,
  EmpleadoOpcion,
} from '@/src/types/empleados.types';

export function listarEmpleados(parametros: ParametrosPaginacion) {
  return solicitarApi<RespuestaPaginada<Empleado>>('/empleados', {
    parametros,
  });
}

export function listarEmpleadosOpciones() {
  return solicitarApi<EmpleadoOpcion[]>('/empleados/opciones');
}

export function crearEmpleado(datos: CrearEmpleadoPayload) {
  return solicitarApi<Empleado, CrearEmpleadoPayload>('/empleados', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function actualizarEmpleado(
  idEmpleado: string,
  datos: ActualizarEmpleadoPayload,
) {
  return solicitarApi<Empleado, ActualizarEmpleadoPayload>(
    `/empleados/${idEmpleado}`,
    {
      metodo: 'PATCH',
      cuerpo: datos,
    },
  );
}

export function archivarEmpleado(idEmpleado: string) {
  return solicitarApi<Empleado>(`/empleados/${idEmpleado}/archivar`, {
    metodo: 'PATCH',
  });
}

export function reactivarEmpleado(idEmpleado: string) {
  return solicitarApi<Empleado>(`/empleados/${idEmpleado}/reactivar`, {
    metodo: 'PATCH',
  });
}

export function eliminarEmpleado(idEmpleado: string) {
  return solicitarApi<{ id_empleado: string }>(`/empleados/${idEmpleado}`, {
    metodo: 'DELETE',
  });
}
