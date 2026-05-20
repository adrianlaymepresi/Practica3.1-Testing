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

export interface CrearClientePayload {
  ci_cliente: string;
  nombres_completo_cliente: string;
  apellidos_completo_cliente: string;
  telefono_cliente?: string;
  correo_electronico_cliente?: string;
  direccion_cliente?: string;
}

export type ActualizarClientePayload = Partial<CrearClientePayload>;
