'use client';

import { FormEvent, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { EstadoRegistro } from '@/src/types/api.types';

export interface OpcionBusqueda {
  valor: string;
  etiqueta: string;
}

interface BarraBusquedaProps {
  opciones: OpcionBusqueda[];
  campoInicial: string;
  placeholder: string;
  mostrarFiltroEstado?: boolean;
  estadoInicial?: EstadoRegistro;
  alBuscar: (
    busqueda: string,
    campoBusqueda: string,
    estadoRegistro?: EstadoRegistro,
  ) => void;
  alLimpiar: () => void;
}

export function BarraBusqueda({
  opciones,
  campoInicial,
  placeholder,
  mostrarFiltroEstado = false,
  estadoInicial = 'activos',
  alBuscar,
  alLimpiar,
}: BarraBusquedaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState(campoInicial);
  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>(estadoInicial);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alBuscar(busqueda.trim(), campoBusqueda, estadoRegistro);
  }

  function manejarLimpiar() {
    setBusqueda('');
    setCampoBusqueda(campoInicial);
    setEstadoRegistro(estadoInicial);
    alLimpiar();
  }

  return (
    <form className="barra-busqueda" onSubmit={manejarEnvio}>
      <label className="campo barra-busqueda__campo">
        <span className="campo__etiqueta">
          Buscar
          <small>Opcional</small>
        </span>
        <input
          className="campo__control"
          value={busqueda}
          maxLength={80}
          placeholder={placeholder}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </label>
      <label className="campo barra-busqueda__select">
        <span className="campo__etiqueta">
          Filtrar por
          <small>Obligatorio</small>
        </span>
        <select
          className="campo__control"
          value={campoBusqueda}
          onChange={(evento) => setCampoBusqueda(evento.target.value)}
        >
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>
      {mostrarFiltroEstado ? (
        <label className="campo barra-busqueda__select">
          <span className="campo__etiqueta">
            Mostrar
            <small>Obligatorio</small>
          </span>
          <select
            className="campo__control"
            value={estadoRegistro}
            onChange={(evento) =>
              setEstadoRegistro(evento.target.value as EstadoRegistro)
            }
          >
            <option value="activos">Activos</option>
            <option value="archivados">Archivados</option>
            <option value="todos">Ambos</option>
          </select>
        </label>
      ) : null}
      <div className="barra-busqueda__acciones">
        <Boton type="submit" icono={<Search size={17} />}>
          Buscar
        </Boton>
        <Boton
          type="button"
          variante="fantasma"
          icono={<X size={17} />}
          onClick={manejarLimpiar}
        >
          Limpiar
        </Boton>
      </div>
    </form>
  );
}
