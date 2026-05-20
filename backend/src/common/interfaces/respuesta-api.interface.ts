export interface RespuestaApi<TDatos = unknown> {
  exito: boolean;
  mensaje: string;
  datos: TDatos;
}
