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
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import { EmpleadosRepository } from './empleados.repository';

@Injectable()
export class EmpleadosService {
  constructor(
    private readonly empleadosRepository: EmpleadosRepository,
    private readonly referenciasRepository: ReferenciasRepository,
  ) {}

  listar(paginacion: PaginacionQueryDto) {
    return this.empleadosRepository.listarEmpleados(paginacion);
  }

  async listarOpciones() {
    return {
      datos: await this.empleadosRepository.listarOpcionesActivas(),
    };
  }

  obtenerPorId(idEmpleado: string) {
    return this.empleadosRepository.obtenerPorId(idEmpleado);
  }

  async crear(crearEmpleadoDto: CrearEmpleadoDto) {
    await this.validarDuplicados(
      crearEmpleadoDto.ci_empleado,
      crearEmpleadoDto.correo_electronico_empleado,
    );
    this.validarFechaNacimiento(crearEmpleadoDto.fecha_nacimiento_empleado);

    const empleado = await this.empleadosRepository.crear({
      ci_empleado: normalizarTextoEspacios(crearEmpleadoDto.ci_empleado),
      nombres_completo_empleado: normalizarNombrePersona(
        crearEmpleadoDto.nombres_completo_empleado,
      ),
      apellidos_completo_empleado: normalizarNombrePersona(
        crearEmpleadoDto.apellidos_completo_empleado,
      ),
      correo_electronico_empleado: normalizarCorreoElectronico(
        crearEmpleadoDto.correo_electronico_empleado,
      ),
      fecha_nacimiento_empleado:
        crearEmpleadoDto.fecha_nacimiento_empleado || null,
      telefono_empleado: crearEmpleadoDto.telefono_empleado
        ? normalizarTelefono(crearEmpleadoDto.telefono_empleado)
        : null,
      es_activo_empleado: true,
    });

    return {
      mensaje: MENSAJES.EMPLEADO_CREADO,
      datos: empleado,
    };
  }

  async actualizar(
    idEmpleado: string,
    actualizarEmpleadoDto: ActualizarEmpleadoDto,
  ) {
    await this.obtenerPorId(idEmpleado);

    if (actualizarEmpleadoDto.ci_empleado) {
      await this.validarCiDisponible(actualizarEmpleadoDto.ci_empleado, idEmpleado);
    }

    if (actualizarEmpleadoDto.correo_electronico_empleado) {
      await this.validarCorreoDisponible(
        actualizarEmpleadoDto.correo_electronico_empleado,
        idEmpleado,
      );
    }

    if (actualizarEmpleadoDto.fecha_nacimiento_empleado !== undefined) {
      this.validarFechaNacimiento(actualizarEmpleadoDto.fecha_nacimiento_empleado);
    }

    const empleado = await this.empleadosRepository.actualizar(idEmpleado, {
      ...(actualizarEmpleadoDto.ci_empleado && {
        ci_empleado: normalizarTextoEspacios(actualizarEmpleadoDto.ci_empleado),
      }),
      ...(actualizarEmpleadoDto.nombres_completo_empleado && {
        nombres_completo_empleado: normalizarNombrePersona(
          actualizarEmpleadoDto.nombres_completo_empleado,
        ),
      }),
      ...(actualizarEmpleadoDto.apellidos_completo_empleado && {
        apellidos_completo_empleado: normalizarNombrePersona(
          actualizarEmpleadoDto.apellidos_completo_empleado,
        ),
      }),
      ...(actualizarEmpleadoDto.correo_electronico_empleado && {
        correo_electronico_empleado: normalizarCorreoElectronico(
          actualizarEmpleadoDto.correo_electronico_empleado,
        ),
      }),
      ...(actualizarEmpleadoDto.fecha_nacimiento_empleado !== undefined && {
        fecha_nacimiento_empleado:
          actualizarEmpleadoDto.fecha_nacimiento_empleado || null,
      }),
      ...(actualizarEmpleadoDto.telefono_empleado !== undefined && {
        telefono_empleado: actualizarEmpleadoDto.telefono_empleado
          ? normalizarTelefono(actualizarEmpleadoDto.telefono_empleado)
          : null,
      }),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.EMPLEADO_ACTUALIZADO,
      datos: empleado,
    };
  }

  async archivar(idEmpleado: string) {
    await this.obtenerPorId(idEmpleado);

    const empleado = await this.empleadosRepository.actualizar(idEmpleado, {
      es_activo_empleado: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_ARCHIVADO,
      datos: empleado,
    };
  }

  async reactivar(idEmpleado: string) {
    await this.obtenerPorId(idEmpleado);

    const empleado = await this.empleadosRepository.actualizar(idEmpleado, {
      es_activo_empleado: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });

    return {
      mensaje: MENSAJES.REGISTRO_REACTIVADO,
      datos: empleado,
    };
  }

  async eliminar(idEmpleado: string) {
    await this.obtenerPorId(idEmpleado);

    const [totalUsuarios, totalOrdenes] = await Promise.all([
      this.referenciasRepository.contarPorCampo('usuario', 'id_empleado', idEmpleado),
      this.referenciasRepository.contarPorCampo(
        'ordenpedido',
        'id_empleado',
        idEmpleado,
      ),
    ]);

    if (totalUsuarios > 0 || totalOrdenes > 0) {
      throw ApiException.solicitudInvalida(
        'No se puede eliminar el empleado porque tiene relaciones vinculadas',
        crearErrorCampo(
          'id_empleado',
          'No puedes eliminar un empleado mientras tenga usuarios u ordenes vinculadas',
        ),
      );
    }

    await this.empleadosRepository.eliminarFisico(idEmpleado);

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_empleado: idEmpleado },
    };
  }

  private async validarDuplicados(ciEmpleado: string, correo: string) {
    await this.validarCiDisponible(ciEmpleado);
    await this.validarCorreoDisponible(correo);
  }

  private async validarCiDisponible(ciEmpleado: string, idActual?: string) {
    const existeCi = await this.empleadosRepository.existeCi(
      normalizarTextoEspacios(ciEmpleado),
      idActual,
    );

    if (existeCi) {
      throw ApiException.conflicto(
        'Ya existe un empleado con ese CI',
        crearErrorCampo('ci_empleado', 'Ya existe un empleado con ese CI'),
      );
    }
  }

  private async validarCorreoDisponible(correo: string, idActual?: string) {
    const existeCorreo = await this.empleadosRepository.existeCorreo(
      normalizarCorreoElectronico(correo),
      idActual,
    );

    if (existeCorreo) {
      throw ApiException.conflicto(
        'Ya existe un empleado con ese correo',
        crearErrorCampo(
          'correo_electronico_empleado',
          'Ya existe un empleado con ese correo',
        ),
      );
    }
  }

  private validarFechaNacimiento(fecha?: string | null) {
    if (!fecha) {
      return;
    }

    const fechaNacimiento = new Date(`${fecha}T00:00:00.000Z`);
    const fechaActual = new Date();
    const fechaMinima = new Date('1900-01-01T00:00:00.000Z');

    if (Number.isNaN(fechaNacimiento.getTime())) {
      throw ApiException.solicitudInvalida(
        'La fecha de nacimiento no es valida',
        crearErrorCampo(
          'fecha_nacimiento_empleado',
          'Debes ingresar una fecha de nacimiento valida',
        ),
      );
    }

    if (fechaNacimiento > fechaActual || fechaNacimiento < fechaMinima) {
      throw ApiException.solicitudInvalida(
        'La fecha de nacimiento esta fuera del rango permitido',
        crearErrorCampo(
          'fecha_nacimiento_empleado',
          'La fecha de nacimiento debe estar entre 1900 y la fecha actual',
        ),
      );
    }
  }
}
