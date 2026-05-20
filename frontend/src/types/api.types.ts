export interface RespuestaApi<TDatos> {
  exito: boolean;
  mensaje: string;
  datos: TDatos;
  errores?: unknown;
}

export type EstadoRegistro = 'activos' | 'archivados' | 'todos';

export interface MetadatosPaginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  tieneAnterior: boolean;
  tieneSiguiente: boolean;
}

export interface RespuestaPaginada<TDatos> {
  registros: TDatos[];
  paginacion: MetadatosPaginacion;
}

export interface ParametrosPaginacion {
  [clave: string]: string | number | boolean | undefined;
  pagina: number;
  limite?: number;
  soloActivos?: boolean;
  estadoRegistro?: EstadoRegistro;
}

export interface ErrorCampo {
  campo: string;
  mensajes: string[];
}

export class ApiError extends Error {
  constructor(
    mensaje: string,
    public readonly estado: number,
    public readonly errores?: unknown,
  ) {
    super(mensaje);
  }
}
