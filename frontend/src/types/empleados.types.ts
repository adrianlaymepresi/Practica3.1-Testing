export interface Empleado {
  id_empleado: string;
  ci_empleado: string;
  nombres_completo_empleado: string;
  apellidos_completo_empleado: string;
  correo_electronico_empleado: string;
  fecha_nacimiento_empleado: string | null;
  telefono_empleado: string | null;
  es_activo_empleado: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmpleadoOpcion {
  id_empleado: string;
  ci_empleado: string;
  nombres_completo_empleado: string;
  apellidos_completo_empleado: string;
  correo_electronico_empleado: string;
}

export interface CrearEmpleadoPayload {
  ci_empleado: string;
  nombres_completo_empleado: string;
  apellidos_completo_empleado: string;
  correo_electronico_empleado: string;
  fecha_nacimiento_empleado?: string;
  telefono_empleado?: string;
}

export type ActualizarEmpleadoPayload = Partial<CrearEmpleadoPayload>;
