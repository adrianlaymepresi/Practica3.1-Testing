'use client';

import { Archive, Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { formatearFechaSimpleZonaHoraria } from '@/src/lib/utils/fechas';
import { Empleado } from '@/src/types/empleados.types';

interface TablaEmpleadosProps {
  empleados: Empleado[];
  alVerDetalle: (empleado: Empleado) => void;
  alEditar: (empleado: Empleado) => void;
  alCambiarEstado: (empleado: Empleado) => void;
  alEliminar: (empleado: Empleado) => void;
}

export function TablaEmpleados({
  empleados,
  alVerDetalle,
  alEditar,
  alCambiarEstado,
  alEliminar,
}: TablaEmpleadosProps) {
  if (empleados.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>No hay empleados registrados</strong>
        <span>Crea el primer empleado para continuar con usuarios.</span>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>CI</th>
            <th>Empleado</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Estado</th>
            <th>Actualizado</th>
            <th>Info</th>
            <th>Editar</th>
            <th>Estado</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado) => (
            <tr key={empleado.id_empleado}>
              <td>{empleado.ci_empleado}</td>
              <td>
                <strong>
                  {empleado.nombres_completo_empleado}{' '}
                  {empleado.apellidos_completo_empleado}
                </strong>
              </td>
              <td>{empleado.correo_electronico_empleado}</td>
              <td>{empleado.telefono_empleado ?? 'Sin telefono'}</td>
              <td>
                <span
                  className={`estado ${
                    empleado.es_activo_empleado
                      ? 'estado--activo'
                      : 'estado--inactivo'
                  }`}
                >
                  {empleado.es_activo_empleado ? 'Activo' : 'Archivado'}
                </span>
              </td>
              <td>{formatearFechaSimpleZonaHoraria(empleado.updated_at)}</td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<Eye size={16} />}
                  onClick={() => alVerDetalle(empleado)}
                  type="button"
                >
                  Ver info
                </Boton>
              </td>
              <td>
                <Boton
                  variante="secundario"
                  icono={<Pencil size={16} />}
                  onClick={() => alEditar(empleado)}
                  type="button"
                >
                  Editar
                </Boton>
              </td>
              <td>
                <Boton
                  variante={
                    empleado.es_activo_empleado ? 'fantasma' : 'secundario'
                  }
                  icono={
                    empleado.es_activo_empleado ? (
                      <Archive size={16} />
                    ) : (
                      <RotateCcw size={16} />
                    )
                  }
                  onClick={() => alCambiarEstado(empleado)}
                  type="button"
                >
                  {empleado.es_activo_empleado ? 'Archivar' : 'Reactivar'}
                </Boton>
              </td>
              <td>
                <Boton
                  variante="peligro"
                  icono={<Trash2 size={16} />}
                  onClick={() => alEliminar(empleado)}
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
