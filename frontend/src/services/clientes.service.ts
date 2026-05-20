import { solicitarApi } from '@/src/lib/api/cliente-api';
import {
  ParametrosPaginacion,
  RespuestaPaginada,
} from '@/src/types/api.types';
import {
  ActualizarClientePayload,
  Cliente,
  ClienteOpcion,
  CrearClientePayload,
} from '@/src/types/clientes.types';

export function listarClientes(parametros: ParametrosPaginacion) {
  return solicitarApi<RespuestaPaginada<Cliente>>('/clientes', {
    parametros,
  });
}

export function listarClientesOpciones() {
  return solicitarApi<ClienteOpcion[]>('/clientes/opciones');
}

export function crearCliente(datos: CrearClientePayload) {
  return solicitarApi<Cliente, CrearClientePayload>('/clientes', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function actualizarCliente(
  idCliente: string,
  datos: ActualizarClientePayload,
) {
  return solicitarApi<Cliente, ActualizarClientePayload>(
    `/clientes/${idCliente}`,
    {
      metodo: 'PATCH',
      cuerpo: datos,
    },
  );
}

export function archivarCliente(idCliente: string) {
  return solicitarApi<Cliente>(`/clientes/${idCliente}/archivar`, {
    metodo: 'PATCH',
  });
}

export function reactivarCliente(idCliente: string) {
  return solicitarApi<Cliente>(`/clientes/${idCliente}/reactivar`, {
    metodo: 'PATCH',
  });
}

export function eliminarCliente(idCliente: string) {
  return solicitarApi<{ id_cliente: string }>(`/clientes/${idCliente}`, {
    metodo: 'DELETE',
  });
}
