export interface Cliente {
  id_cliente: string;
  ci_cliente: string;
  nombres_completo_cliente: string;
  apellidos_completo_cliente: string;
  telefono_cliente: string | null;
  correo_electronico_cliente: string | null;
  direccion_cliente: string | null;
  es_activo_cliente: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CrearCliente = Pick<
  Cliente,
  | 'ci_cliente'
  | 'nombres_completo_cliente'
  | 'apellidos_completo_cliente'
  | 'telefono_cliente'
  | 'correo_electronico_cliente'
  | 'direccion_cliente'
  | 'es_activo_cliente'
>;

export type ActualizarCliente = Partial<CrearCliente> & {
  updated_at: string;
  deleted_at?: string | null;
};
