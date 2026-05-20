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
