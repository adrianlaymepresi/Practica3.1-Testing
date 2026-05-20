export interface Rol {
  id_rol: string;
  nombre_rol: string;
  descripcion_rol: string | null;
  es_activo_rol: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CrearRol = Pick<
  Rol,
  'nombre_rol' | 'descripcion_rol' | 'es_activo_rol'
>;

export type ActualizarRol = Partial<CrearRol> & {
  updated_at: string;
  deleted_at?: string | null;
};
