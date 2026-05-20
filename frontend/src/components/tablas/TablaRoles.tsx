'use client';

import { Archive, Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { formatearFechaSimpleZonaHoraria } from '@/src/lib/utils/fechas';
import { Rol } from '@/src/types/roles.types';

interface TablaRolesProps {
  roles: Rol[];
  alVerDetalle: (rol: Rol) => void;
  alEditar: (rol: Rol) => void;
  alCambiarEstado: (rol: Rol) => void;
  alEliminar: (rol: Rol) => void;
}

export function TablaRoles({
  roles,
  alVerDetalle,
  alEditar,
  alCambiarEstado,
  alEliminar,
}: TablaRolesProps) {
  if (roles.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>No hay roles registrados</strong>
        <span>Crea el primer rol para comenzar con el panel.</span>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>Rol</th>
            <th>Descripcion</th>
            <th>Estado</th>
            <th>Actualizado</th>
            <th>Info</th>
            <th>Editar</th>
            <th>Estado</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id_rol}>
              <td>
                <strong>{rol.nombre_rol}</strong>
              </td>
              <td>{rol.descripcion_rol ?? 'Sin descripcion'}</td>
              <td>
                <span
                  className={`estado ${
                    rol.es_activo_rol ? 'estado--activo' : 'estado--inactivo'
                  }`}
                >
                  {rol.es_activo_rol ? 'Activo' : 'Archivado'}
                </span>
              </td>
              <td>{formatearFechaSimpleZonaHoraria(rol.updated_at)}</td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<Eye size={16} />}
                  onClick={() => alVerDetalle(rol)}
                  type="button"
                >
                  Ver info
                </Boton>
              </td>
              <td>
                <Boton
                  variante="secundario"
                  icono={<Pencil size={16} />}
                  onClick={() => alEditar(rol)}
                  type="button"
                >
                  Editar
                </Boton>
              </td>
              <td>
                <Boton
                  variante={rol.es_activo_rol ? 'fantasma' : 'secundario'}
                  icono={
                    rol.es_activo_rol ? (
                      <Archive size={16} />
                    ) : (
                      <RotateCcw size={16} />
                    )
                  }
                  onClick={() => alCambiarEstado(rol)}
                  type="button"
                >
                  {rol.es_activo_rol ? 'Archivar' : 'Reactivar'}
                </Boton>
              </td>
              <td>
                <Boton
                  variante="peligro"
                  icono={<Trash2 size={16} />}
                  onClick={() => alEliminar(rol)}
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
