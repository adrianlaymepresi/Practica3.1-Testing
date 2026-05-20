export interface Rol {
  id_rol: string;
  nombre_rol: string;
  descripcion_rol: string | null;
  es_activo_rol: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CrearRolPayload {
  nombre_rol: string;
  descripcion_rol?: string;
  es_activo_rol?: boolean;
}

export interface ActualizarRolPayload {
  nombre_rol?: string;
  descripcion_rol?: string;
  es_activo_rol?: boolean;
}
