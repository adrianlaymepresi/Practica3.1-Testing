import { Injectable } from '@nestjs/common';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import { ReferenciasRepository } from '../../common/database/referencias.repository';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { normalizarTextoCatalogo, normalizarTextoEspacios } from '../../common/utils/textos.util';
import { crearErrorCampo } from '../../common/utils/validacion.util';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { CrearRolDto } from './dto/crear-rol.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly referenciasRepository: ReferenciasRepository,
  ) {}

  listar(paginacion: PaginacionQueryDto) {
    return this.rolesRepository.listarRoles(paginacion);
  }

  obtenerPorId(idRol: string) {
    return this.rolesRepository.obtenerPorId(idRol);
  }

  async crear(crearRolDto: CrearRolDto) {
    const nombreRol = normalizarTextoCatalogo(crearRolDto.nombre_rol);
    await this.validarNombreDisponible(nombreRol);

    const rol = await this.rolesRepository.crear({
      nombre_rol: nombreRol,
      descripcion_rol: crearRolDto.descripcion_rol
        ? normalizarTextoEspacios(crearRolDto.descripcion_rol)
        : null,
      es_activo_rol: crearRolDto.es_activo_rol ?? true,
    });

    return {
      mensaje: MENSAJES.ROL_CREADO,
      datos: rol,
    };
  }

  async actualizar(idRol: string, actualizarRolDto: ActualizarRolDto) {
    await this.obtenerPorId(idRol);

    if (actualizarRolDto.nombre_rol) {
      await this.validarNombreDisponible(
        normalizarTextoCatalogo(actualizarRolDto.nombre_rol),
        idRol,
      );
    }

    const rol = await this.rolesRepository.actualizar(idRol, {
      ...(actualizarRolDto.nombre_rol && {
        nombre_rol: normalizarTextoCatalogo(actualizarRolDto.nombre_rol),
      }),
      ...(actualizarRolDto.descripcion_rol !== undefined && {
        descripcion_rol: actualizarRolDto.descripcion_rol
          ? normalizarTextoEspacios(actualizarRolDto.descripcion_rol)
          : null,
      }),
      ...(actualizarRolDto.es_activo_rol !== undefined && {
        es_activo_rol: actualizarRolDto.es_activo_rol,
      }),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.ROL_ACTUALIZADO,
      datos: rol,
    };
  }

  async archivar(idRol: string) {
    await this.obtenerPorId(idRol);

    const rol = await this.rolesRepository.actualizar(idRol, {
      es_activo_rol: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_ARCHIVADO,
      datos: rol,
    };
  }

  async reactivar(idRol: string) {
    await this.obtenerPorId(idRol);

    const rol = await this.rolesRepository.actualizar(idRol, {
      es_activo_rol: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_REACTIVADO,
      datos: rol,
    };
  }

  async eliminar(idRol: string) {
    await this.obtenerPorId(idRol);

    const totalUsuarios = await this.referenciasRepository.contarPorCampo(
      'usuario',
      'id_rol',
      idRol,
    );

    if (totalUsuarios > 0) {
      throw ApiException.solicitudInvalida(
        'No se puede eliminar el rol porque tiene usuarios vinculados',
        crearErrorCampo(
          'id_rol',
          'No puedes eliminar un rol mientras tenga usuarios vinculados',
        ),
      );
    }

    await this.rolesRepository.eliminarFisico(idRol);

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_rol: idRol },
    };
  }

  private async validarNombreDisponible(nombreRol: string, idActual?: string) {
    const rolExistente = await this.rolesRepository.buscarPorNombre(nombreRol);

    if (rolExistente && rolExistente.id_rol !== idActual) {
      throw ApiException.conflicto(
        'Ya existe un rol con ese nombre',
        crearErrorCampo('nombre_rol', 'Ya existe un rol con ese nombre'),
      );
    }
  }
}
