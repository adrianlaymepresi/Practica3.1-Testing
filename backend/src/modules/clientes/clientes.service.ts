import { Injectable } from '@nestjs/common';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import { ReferenciasRepository } from '../../common/database/referencias.repository';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import {
  normalizarCorreoElectronico,
  normalizarNombrePersona,
  normalizarTelefono,
  normalizarTextoEspacios,
} from '../../common/utils/textos.util';
import { crearErrorCampo } from '../../common/utils/validacion.util';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ClientesRepository } from './clientes.repository';

@Injectable()
export class ClientesService {
  constructor(
    private readonly clientesRepository: ClientesRepository,
    private readonly referenciasRepository: ReferenciasRepository,
  ) {}

  listar(paginacion: PaginacionQueryDto) {
    return this.clientesRepository.listarClientes(paginacion);
  }

  obtenerPorId(idCliente: string) {
    return this.clientesRepository.obtenerPorId(idCliente);
  }

  async crear(crearClienteDto: CrearClienteDto) {
    await this.validarCiDisponible(crearClienteDto.ci_cliente);

    const cliente = await this.clientesRepository.crear({
      ci_cliente: normalizarTextoEspacios(crearClienteDto.ci_cliente),
      nombres_completo_cliente: normalizarNombrePersona(
        crearClienteDto.nombres_completo_cliente,
      ),
      apellidos_completo_cliente: normalizarNombrePersona(
        crearClienteDto.apellidos_completo_cliente,
      ),
      telefono_cliente: crearClienteDto.telefono_cliente
        ? normalizarTelefono(crearClienteDto.telefono_cliente)
        : null,
      correo_electronico_cliente: crearClienteDto.correo_electronico_cliente
        ? normalizarCorreoElectronico(
            crearClienteDto.correo_electronico_cliente,
          )
        : null,
      direccion_cliente: crearClienteDto.direccion_cliente
        ? normalizarTextoEspacios(crearClienteDto.direccion_cliente)
        : null,
      es_activo_cliente: true,
    });

    return {
      mensaje: MENSAJES.CLIENTE_CREADO,
      datos: cliente,
    };
  }

  async actualizar(
    idCliente: string,
    actualizarClienteDto: ActualizarClienteDto,
  ) {
    await this.obtenerPorId(idCliente);

    if (actualizarClienteDto.ci_cliente) {
      await this.validarCiDisponible(actualizarClienteDto.ci_cliente, idCliente);
    }

    const cliente = await this.clientesRepository.actualizar(idCliente, {
      ...(actualizarClienteDto.ci_cliente && {
        ci_cliente: normalizarTextoEspacios(actualizarClienteDto.ci_cliente),
      }),
      ...(actualizarClienteDto.nombres_completo_cliente && {
        nombres_completo_cliente: normalizarNombrePersona(
          actualizarClienteDto.nombres_completo_cliente,
        ),
      }),
      ...(actualizarClienteDto.apellidos_completo_cliente && {
        apellidos_completo_cliente: normalizarNombrePersona(
          actualizarClienteDto.apellidos_completo_cliente,
        ),
      }),
      ...(actualizarClienteDto.telefono_cliente !== undefined && {
        telefono_cliente: actualizarClienteDto.telefono_cliente
          ? normalizarTelefono(actualizarClienteDto.telefono_cliente)
          : null,
      }),
      ...(actualizarClienteDto.correo_electronico_cliente !== undefined && {
        correo_electronico_cliente:
          actualizarClienteDto.correo_electronico_cliente
            ? normalizarCorreoElectronico(
                actualizarClienteDto.correo_electronico_cliente,
              )
            : null,
      }),
      ...(actualizarClienteDto.direccion_cliente !== undefined && {
        direccion_cliente: actualizarClienteDto.direccion_cliente
          ? normalizarTextoEspacios(actualizarClienteDto.direccion_cliente)
          : null,
      }),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.CLIENTE_ACTUALIZADO,
      datos: cliente,
    };
  }

  async archivar(idCliente: string) {
    await this.obtenerPorId(idCliente);

    const cliente = await this.clientesRepository.actualizar(idCliente, {
      es_activo_cliente: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_ARCHIVADO,
      datos: cliente,
    };
  }

  async reactivar(idCliente: string) {
    await this.obtenerPorId(idCliente);

    const cliente = await this.clientesRepository.actualizar(idCliente, {
      es_activo_cliente: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_REACTIVADO,
      datos: cliente,
    };
  }

  async eliminar(idCliente: string) {
    await this.obtenerPorId(idCliente);

    const totalOrdenes = await this.referenciasRepository.contarPorCampo(
      'ordenpedido',
      'id_cliente',
      idCliente,
    );

    if (totalOrdenes > 0) {
      throw ApiException.solicitudInvalida(
        'No se puede eliminar el cliente porque tiene ordenes vinculadas',
        crearErrorCampo(
          'id_cliente',
          'No puedes eliminar un cliente mientras tenga ordenes vinculadas',
        ),
      );
    }

    await this.clientesRepository.eliminarFisico(idCliente);

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_cliente: idCliente },
    };
  }

  private async validarCiDisponible(ciCliente: string, idActual?: string) {
    const existeCi = await this.clientesRepository.existeCi(
      normalizarTextoEspacios(ciCliente),
      idActual,
    );

    if (existeCi) {
      throw ApiException.conflicto(
        'Ya existe un cliente con ese CI',
        crearErrorCampo('ci_cliente', 'Ya existe un cliente con ese CI'),
      );
    }
  }
}
