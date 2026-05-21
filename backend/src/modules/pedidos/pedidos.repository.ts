import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { SupabaseService } from '../../common/database/supabase.service';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { paginarColeccion } from '../../common/utils/paginacion.util';
import {
  ActualizarPedido,
  CrearPedido,
  PedidoRegistro,
} from './interfaces/pedido.interface';

interface PedidoRegistroCrudo extends Omit<PedidoRegistro, 'cliente' | 'empleado'> {
  cliente?: PedidoRegistro['cliente'] | PedidoRegistro['cliente'][];
  empleado?: PedidoRegistro['empleado'] | PedidoRegistro['empleado'][];
}

@Injectable()
export class PedidosRepository extends BaseRepository<
  PedidoRegistro,
  CrearPedido,
  ActualizarPedido
> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService, 'ordenpedido', 'id_orden_pedido');
  }

  async listarPedidos(paginacion: PaginacionQueryDto) {
    const { data, error } = await this.supabaseService.cliente
      .from('ordenpedido')
      .select(
        'id_orden_pedido, id_cliente, id_empleado, codigo_orden_pedido, fecha_orden_pedido, estado_orden_pedido, observacion_orden_pedido, subtotal_orden_pedido, descuento_orden_pedido, total_orden_pedido, es_activo_orden_pedido, created_at, updated_at, deleted_at, cliente(id_cliente, ci_cliente, nombres_completo_cliente, apellidos_completo_cliente, telefono_cliente, correo_electronico_cliente, direccion_cliente), empleado(id_empleado, ci_empleado, nombres_completo_empleado, apellidos_completo_empleado, correo_electronico_empleado)',
      )
      .order('fecha_orden_pedido', { ascending: false });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    const termino = paginacion.busqueda?.trim().toUpperCase() ?? '';
    const campoBusqueda = paginacion.campoBusqueda ?? 'codigo_orden_pedido';
    const estadoRegistro =
      paginacion.estadoRegistro ??
      (paginacion.soloActivos === false ? 'todos' : 'activos');

    const pedidos = ((data ?? []) as PedidoRegistroCrudo[])
      .map((pedido) => this.normalizarPedido(pedido))
      .filter((pedido) => {
        if (estadoRegistro === 'activos') {
          return pedido.es_activo_orden_pedido && !pedido.deleted_at;
        }

        if (estadoRegistro === 'archivados') {
          return (
            !pedido.es_activo_orden_pedido || Boolean(pedido.deleted_at)
          );
        }

        return true;
      })
      .filter((pedido) => this.coincideBusqueda(pedido, campoBusqueda, termino));

    return paginarColeccion(pedidos, paginacion);
  }

  existeCodigoPedido(codigoPedido: string, idPedidoActual?: string) {
    return this.existePorCampo(
      'codigo_orden_pedido',
      codigoPedido,
      idPedidoActual
        ? { campo: 'id_orden_pedido', valor: idPedidoActual }
        : undefined,
    );
  }

  async contarPedidosRegistrados() {
    const { count, error } = await this.supabaseService.cliente
      .from('ordenpedido')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return count ?? 0;
  }

  async obtenerPedidoConRelacionesPorId(idPedido: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('ordenpedido')
      .select(
        'id_orden_pedido, id_cliente, id_empleado, codigo_orden_pedido, fecha_orden_pedido, estado_orden_pedido, observacion_orden_pedido, subtotal_orden_pedido, descuento_orden_pedido, total_orden_pedido, es_activo_orden_pedido, created_at, updated_at, deleted_at, cliente(id_cliente, ci_cliente, nombres_completo_cliente, apellidos_completo_cliente, telefono_cliente, correo_electronico_cliente, direccion_cliente), empleado(id_empleado, ci_empleado, nombres_completo_empleado, apellidos_completo_empleado, correo_electronico_empleado)',
      )
      .eq('id_orden_pedido', idPedido)
      .single();

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return this.normalizarPedido(data as PedidoRegistroCrudo);
  }

  private coincideBusqueda(
    pedido: PedidoRegistro,
    campoBusqueda: string,
    termino: string,
  ) {
    if (!termino) {
      return true;
    }

    const nombreCliente = [
      pedido.cliente?.nombres_completo_cliente ?? '',
      pedido.cliente?.apellidos_completo_cliente ?? '',
    ]
      .join(' ')
      .trim()
      .toUpperCase();
    const nombreEmpleado = [
      pedido.empleado?.nombres_completo_empleado ?? '',
      pedido.empleado?.apellidos_completo_empleado ?? '',
    ]
      .join(' ')
      .trim()
      .toUpperCase();
    const valoresPorCampo: Record<string, string> = {
      codigo_orden_pedido: pedido.codigo_orden_pedido.toUpperCase(),
      cliente: nombreCliente,
      ci_cliente: pedido.cliente?.ci_cliente?.toUpperCase() ?? '',
      empleado: nombreEmpleado,
      ci_empleado: pedido.empleado?.ci_empleado?.toUpperCase() ?? '',
      estado_orden_pedido: pedido.estado_orden_pedido.toUpperCase(),
    };

    return (valoresPorCampo[campoBusqueda] ?? '').includes(termino);
  }

  private normalizarPedido(pedido: PedidoRegistroCrudo): PedidoRegistro {
    return {
      ...pedido,
      cliente: Array.isArray(pedido.cliente)
        ? (pedido.cliente[0] ?? null)
        : (pedido.cliente ?? null),
      empleado: Array.isArray(pedido.empleado)
        ? (pedido.empleado[0] ?? null)
        : (pedido.empleado ?? null),
    };
  }
}
