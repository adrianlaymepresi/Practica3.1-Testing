import { Injectable } from '@nestjs/common';
import { MENSAJES } from '../../common/constants/mensajes.constant';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { hashearContrasenia } from '../../common/utils/bcrypt.util';
import { crearErrorCampo } from '../../common/utils/validacion.util';
import {
  construirContraseniaInicial,
  construirNombreUsuario,
} from '../../common/utils/usuario.util';
import { EmpleadosRepository } from '../empleados/empleados.repository';
import { RolesRepository } from '../roles/roles.repository';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuarioRegistro } from './interfaces/usuario.interface';
import { UsuariosRepository } from './usuarios.repository';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly empleadosRepository: EmpleadosRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async listar(paginacion: PaginacionQueryDto) {
    const respuesta = await this.usuariosRepository.listarUsuarios(paginacion);

    return {
      datos: {
        ...respuesta,
        registros: respuesta.registros.map((usuario) =>
          this.quitarContrasenia(usuario),
        ),
      },
    };
  }

  async obtenerPorId(idUsuario: string) {
    const usuario =
      await this.usuariosRepository.obtenerUsuarioConRelacionesPorId(idUsuario);

    return {
      datos: this.quitarContrasenia(usuario),
    };
  }

  async crear(crearUsuarioDto: CrearUsuarioDto) {
    const empleado = await this.obtenerEmpleadoActivo(crearUsuarioDto.id_empleado);
    const rol = await this.obtenerRolActivo(crearUsuarioDto.id_rol);
    const nombreUsuario = construirNombreUsuario(
      empleado.nombres_completo_empleado,
      empleado.apellidos_completo_empleado,
      empleado.ci_empleado,
    );

    await this.validarNombreDisponible(nombreUsuario);

    const usuarioCreado = await this.usuariosRepository.crear({
      id_empleado: empleado.id_empleado,
      id_rol: rol.id_rol,
      nombre_usuario: nombreUsuario,
      contrasenia_usuario: await hashearContrasenia(
        construirContraseniaInicial(empleado.ci_empleado, rol.nombre_rol),
      ),
      es_activo_usuario: true,
    });

    const usuario =
      await this.usuariosRepository.obtenerUsuarioConRelacionesPorId(
        usuarioCreado.id_usuario,
      );

    return {
      mensaje: MENSAJES.USUARIO_CREADO,
      datos: this.quitarContrasenia(usuario),
    };
  }

  async actualizar(
    idUsuario: string,
    actualizarUsuarioDto: ActualizarUsuarioDto,
  ) {
    const usuarioActual =
      await this.usuariosRepository.obtenerUsuarioConRelacionesPorId(idUsuario);

    const empleadoActualizado = actualizarUsuarioDto.id_empleado
      ? await this.obtenerEmpleadoActivo(actualizarUsuarioDto.id_empleado)
      : undefined;
    const rolActualizado = actualizarUsuarioDto.id_rol
      ? await this.obtenerRolActivo(actualizarUsuarioDto.id_rol)
      : undefined;

    const nombreUsuarioActualizado = empleadoActualizado
      ? construirNombreUsuario(
          empleadoActualizado.nombres_completo_empleado,
          empleadoActualizado.apellidos_completo_empleado,
          empleadoActualizado.ci_empleado,
        )
      : undefined;

    if (nombreUsuarioActualizado) {
      await this.validarNombreDisponible(nombreUsuarioActualizado, idUsuario);
    }

    await this.usuariosRepository.actualizar(idUsuario, {
      ...(empleadoActualizado && {
        id_empleado: empleadoActualizado.id_empleado,
      }),
      ...(rolActualizado && { id_rol: rolActualizado.id_rol }),
      ...(nombreUsuarioActualizado && {
        nombre_usuario: nombreUsuarioActualizado,
      }),
      ...(actualizarUsuarioDto.contrasenia_usuario && {
        contrasenia_usuario: await hashearContrasenia(
          actualizarUsuarioDto.contrasenia_usuario,
        ),
      }),
      updated_at: new Date().toISOString(),
    });

    void usuarioActual;

    const usuario =
      await this.usuariosRepository.obtenerUsuarioConRelacionesPorId(idUsuario);

    return {
      mensaje: MENSAJES.USUARIO_ACTUALIZADO,
      datos: this.quitarContrasenia(usuario),
    };
  }

  async archivar(idUsuario: string) {
    await this.usuariosRepository.obtenerPorId(idUsuario);

    await this.usuariosRepository.actualizar(idUsuario, {
      es_activo_usuario: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const usuario =
      await this.usuariosRepository.obtenerUsuarioConRelacionesPorId(idUsuario);

    return {
      mensaje: MENSAJES.REGISTRO_ARCHIVADO,
      datos: this.quitarContrasenia(usuario),
    };
  }

  async reactivar(idUsuario: string) {
    await this.usuariosRepository.obtenerPorId(idUsuario);

    await this.usuariosRepository.actualizar(idUsuario, {
      es_activo_usuario: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });

    const usuario =
      await this.usuariosRepository.obtenerUsuarioConRelacionesPorId(idUsuario);

    return {
      mensaje: MENSAJES.REGISTRO_REACTIVADO,
      datos: this.quitarContrasenia(usuario),
    };
  }

  async eliminar(idUsuario: string) {
    await this.usuariosRepository.obtenerPorId(idUsuario);
    await this.usuariosRepository.eliminarFisico(idUsuario);

    return {
      mensaje: MENSAJES.REGISTRO_ELIMINADO,
      datos: { id_usuario: idUsuario },
    };
  }

  private async obtenerEmpleadoActivo(idEmpleado: string) {
    const empleado = await this.empleadosRepository.obtenerPorId(idEmpleado);

    if (!empleado.es_activo_empleado || empleado.deleted_at) {
      throw ApiException.solicitudInvalida(
        'El empleado seleccionado no esta disponible',
        crearErrorCampo(
          'id_empleado',
          'Solo puedes asignar empleados activos y no archivados',
        ),
      );
    }

    return empleado;
  }

  private async obtenerRolActivo(idRol: string) {
    const rol = await this.rolesRepository.obtenerPorId(idRol);

    if (!rol.es_activo_rol || rol.deleted_at) {
      throw ApiException.solicitudInvalida(
        'El rol seleccionado no esta disponible',
        crearErrorCampo(
          'id_rol',
          'Solo puedes asignar roles activos y no archivados',
        ),
      );
    }

    return rol;
  }

  private async validarNombreDisponible(
    nombreUsuario: string,
    idUsuarioActual?: string,
  ) {
    const existeNombre = await this.usuariosRepository.existeNombreUsuario(
      nombreUsuario,
      idUsuarioActual,
    );

    if (existeNombre) {
      throw ApiException.conflicto(
        'Ya existe un usuario asociado a ese empleado',
        crearErrorCampo(
          'id_empleado',
          'Ya existe un usuario asociado al empleado seleccionado',
        ),
      );
    }
  }

  private quitarContrasenia(usuario: UsuarioRegistro) {
    const { contrasenia_usuario: _, ...usuarioSeguro } = usuario;

    return usuarioSeguro;
  }
}
