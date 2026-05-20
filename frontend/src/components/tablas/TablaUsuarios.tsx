'use client';

import { Archive, Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import {
  formatearFechaHoraZonaHoraria,
  formatearFechaSimpleZonaHoraria,
} from '@/src/lib/utils/fechas';
import { Usuario } from '@/src/types/usuarios.types';

interface TablaUsuariosProps {
  usuarios: Usuario[];
  alVerDetalle: (usuario: Usuario) => void;
  alEditar: (usuario: Usuario) => void;
  alCambiarEstado: (usuario: Usuario) => void;
  alEliminar: (usuario: Usuario) => void;
}

export function TablaUsuarios({
  usuarios,
  alVerDetalle,
  alEditar,
  alCambiarEstado,
  alEliminar,
}: TablaUsuariosProps) {
  if (usuarios.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>No hay usuarios registrados</strong>
        <span>Crea el primer usuario asignando un empleado y un rol activo.</span>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Empleado</th>
            <th>Rol</th>
            <th>Ultima sesion</th>
            <th>Estado</th>
            <th>Actualizado</th>
            <th>Info</th>
            <th>Editar</th>
            <th>Estado</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>
                <strong>{usuario.nombre_usuario}</strong>
              </td>
              <td>
                {usuario.empleado
                  ? `${usuario.empleado.ci_empleado} - ${usuario.empleado.nombres_completo_empleado} ${usuario.empleado.apellidos_completo_empleado}`
                  : 'Sin empleado'}
              </td>
              <td>{usuario.rol?.nombre_rol ?? 'Sin rol'}</td>
              <td>{formatearFechaHoraZonaHoraria(usuario.ultima_sesion_usuario)}</td>
              <td>
                <span
                  className={`estado ${
                    usuario.es_activo_usuario
                      ? 'estado--activo'
                      : 'estado--inactivo'
                  }`}
                >
                  {usuario.es_activo_usuario ? 'Activo' : 'Archivado'}
                </span>
              </td>
              <td>{formatearFechaSimpleZonaHoraria(usuario.updated_at)}</td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<Eye size={16} />}
                  onClick={() => alVerDetalle(usuario)}
                  type="button"
                >
                  Ver info
                </Boton>
              </td>
              <td>
                <Boton
                  variante="secundario"
                  icono={<Pencil size={16} />}
                  onClick={() => alEditar(usuario)}
                  type="button"
                >
                  Editar
                </Boton>
              </td>
              <td>
                <Boton
                  variante={
                    usuario.es_activo_usuario ? 'fantasma' : 'secundario'
                  }
                  icono={
                    usuario.es_activo_usuario ? (
                      <Archive size={16} />
                    ) : (
                      <RotateCcw size={16} />
                    )
                  }
                  onClick={() => alCambiarEstado(usuario)}
                  type="button"
                >
                  {usuario.es_activo_usuario ? 'Archivar' : 'Reactivar'}
                </Boton>
              </td>
              <td>
                <Boton
                  variante="peligro"
                  icono={<Trash2 size={16} />}
                  onClick={() => alEliminar(usuario)}
                  type="button"
                >
                  Eliminar
                </Boton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
