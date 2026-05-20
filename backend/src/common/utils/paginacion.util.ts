import { PaginacionQueryDto } from '../dto/paginacion-query.dto';
import {
  MetadatosPaginacion,
  RespuestaPaginada,
} from '../interfaces/respuesta-paginada.interface';

export function normalizarPaginacion(query: PaginacionQueryDto) {
  const pagina = Math.max(Number(query.pagina ?? 1), 1);
  const limite = Math.min(Math.max(Number(query.limite ?? 10), 1), 50);
  const desde = (pagina - 1) * limite;
  const hasta = desde + limite - 1;

  return {
    pagina,
    limite,
    desde,
    hasta,
  };
}

export function crearMetadatosPaginacion(
  pagina: number,
  limite: number,
  total: number,
): MetadatosPaginacion {
  const totalPaginas = Math.max(Math.ceil(total / limite), 1);

  return {
    pagina,
    limite,
    total,
    totalPaginas,
    tieneAnterior: pagina > 1,
    tieneSiguiente: pagina < totalPaginas,
  };
}

export function paginarColeccion<TDato>(
  registros: TDato[],
  paginacion: Pick<PaginacionQueryDto, 'pagina' | 'limite'>,
): RespuestaPaginada<TDato> {
  const { pagina, limite, desde, hasta } = normalizarPaginacion(paginacion);

  return {
    registros: registros.slice(desde, hasta + 1),
    paginacion: crearMetadatosPaginacion(pagina, limite, registros.length),
  };
}
