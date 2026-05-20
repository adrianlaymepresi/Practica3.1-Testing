'use client';

import { Archive, Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { formatearFechaSimpleZonaHoraria } from '@/src/lib/utils/fechas';
import { Cliente } from '@/src/types/clientes.types';

interface TablaClientesProps {
  clientes: Cliente[];
  alVerDetalle: (cliente: Cliente) => void;
  alEditar: (cliente: Cliente) => void;
  alCambiarEstado: (cliente: Cliente) => void;
  alEliminar: (cliente: Cliente) => void;
}

export function TablaClientes({
  clientes,
  alVerDetalle,
  alEditar,
  alCambiarEstado,
  alEliminar,
}: TablaClientesProps) {
  if (clientes.length === 0) {
    return (
      <div className="tabla-vacia">
        <strong>No hay clientes registrados</strong>
        <span>Crea el primer cliente para preparar los pedidos.</span>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>CI</th>
            <th>Cliente</th>
            <th>Telefono</th>
            <th>Correo</th>
            <th>Direccion</th>
            <th>Estado</th>
            <th>Actualizado</th>
            <th>Info</th>
            <th>Editar</th>
            <th>Estado</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id_cliente}>
              <td>{cliente.ci_cliente}</td>
              <td>
                <strong>
                  {cliente.nombres_completo_cliente}{' '}
                  {cliente.apellidos_completo_cliente}
                </strong>
              </td>
              <td>{cliente.telefono_cliente ?? 'Sin telefono'}</td>
              <td>{cliente.correo_electronico_cliente ?? 'Sin correo'}</td>
              <td>{cliente.direccion_cliente ?? 'Sin direccion'}</td>
              <td>
                <span
                  className={`estado ${
                    cliente.es_activo_cliente
                      ? 'estado--activo'
                      : 'estado--inactivo'
                  }`}
                >
                  {cliente.es_activo_cliente ? 'Activo' : 'Archivado'}
                </span>
              </td>
              <td>{formatearFechaSimpleZonaHoraria(cliente.updated_at)}</td>
              <td>
                <Boton
                  variante="fantasma"
                  icono={<Eye size={16} />}
                  onClick={() => alVerDetalle(cliente)}
                  type="button"
                >
                  Ver info
                </Boton>
              </td>
              <td>
                <Boton
                  variante="secundario"
                  icono={<Pencil size={16} />}
                  onClick={() => alEditar(cliente)}
                  type="button"
                >
                  Editar
                </Boton>
              </td>
              <td>
                <Boton
                  variante={
                    cliente.es_activo_cliente ? 'fantasma' : 'secundario'
                  }
                  icono={
                    cliente.es_activo_cliente ? (
                      <Archive size={16} />
                    ) : (
                      <RotateCcw size={16} />
                    )
                  }
                  onClick={() => alCambiarEstado(cliente)}
                  type="button"
                >
                  {cliente.es_activo_cliente ? 'Archivar' : 'Reactivar'}
                </Boton>
              </td>
              <td>
                <Boton
                  variante="peligro"
                  icono={<Trash2 size={16} />}
                  onClick={() => alEliminar(cliente)}
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
