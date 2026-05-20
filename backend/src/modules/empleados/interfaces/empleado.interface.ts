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

export type CrearEmpleado = Pick<
  Empleado,
  | 'ci_empleado'
  | 'nombres_completo_empleado'
  | 'apellidos_completo_empleado'
  | 'correo_electronico_empleado'
  | 'fecha_nacimiento_empleado'
  | 'telefono_empleado'
  | 'es_activo_empleado'
>;

export type ActualizarEmpleado = Partial<CrearEmpleado> & {
  updated_at: string;
  deleted_at?: string | null;
};
