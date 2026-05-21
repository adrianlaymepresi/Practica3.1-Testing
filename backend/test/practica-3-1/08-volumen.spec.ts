import { describe, expect, it, jest } from '@jest/globals';
import { ProductosRepository } from '../../src/modules/productos/productos.repository';
import { Producto } from '../../src/modules/productos/interfaces/producto.interface';

function crearProductosMasivos(total: number): Producto[] {
  return Array.from({ length: total }, (_, indice) => {
    const numero = indice + 1;
    const numeroTexto = String(numero).padStart(4, '0');

    return {
      id_producto: `00000000-0000-4000-8000-${numeroTexto.padStart(12, '0')}`,
      codigo_producto: `P-${numeroTexto}`,
      nombre_producto: `PRODUCTO ${numeroTexto}`,
      descripcion_producto: `DESCRIPCION ${numeroTexto}`,
      precio_producto: 100 + numero,
      stock_producto: numero,
      nombre_bucket_imagen_producto: null,
      ruta_imagen_producto: null,
      url_imagen_producto: null,
      tipo_mime_imagen_producto: null,
      tamano_bytes_imagen_producto: null,
      es_activo_producto: true,
      created_at: new Date(2026, 0, 1, 0, numero).toISOString(),
      updated_at: new Date(2026, 0, 1, 0, numero).toISOString(),
      deleted_at: null,
    };
  });
}

function crearConsultaProductos(productos: Producto[]) {
  const estado = {
    filtroActivo: undefined as boolean | undefined,
    filtrarEliminados: false,
    busqueda: undefined as { campo: string; valor: string } | undefined,
    ordenPor: 'created_at',
    ascendente: false,
  };

  const consulta = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn((campo: string, valor: string | number | boolean | null) => {
      if (campo === 'es_activo_producto') {
        estado.filtroActivo = Boolean(valor);
      }

      return consulta;
    }),
    is: jest.fn((campo: string, valor: null) => {
      if (campo === 'deleted_at' && valor === null) {
        estado.filtrarEliminados = true;
      }

      return consulta;
    }),
    ilike: jest.fn((campo: string, valor: string) => {
      estado.busqueda = {
        campo,
        valor: valor.replaceAll('%', '').toUpperCase(),
      };
      return consulta;
    }),
    order: jest.fn((campo: string, opciones: { ascending: boolean }) => {
      estado.ordenPor = campo;
      estado.ascendente = opciones.ascending;
      return consulta;
    }),
    range: jest.fn(async (desde: number, hasta: number) => {
      let registros = [...productos];

      if (estado.filtroActivo !== undefined) {
        registros = registros.filter(
          (producto) => producto.es_activo_producto === estado.filtroActivo,
        );
      }

      if (estado.filtrarEliminados) {
        registros = registros.filter(
          (producto) => producto.deleted_at === null,
        );
      }

      if (estado.busqueda) {
        registros = registros.filter((producto) =>
          String(producto[estado.busqueda!.campo as keyof Producto] ?? '')
            .toUpperCase()
            .includes(estado.busqueda!.valor),
        );
      }

      registros.sort((a, b) => {
        const valorA = String(a[estado.ordenPor as keyof Producto] ?? '');
        const valorB = String(b[estado.ordenPor as keyof Producto] ?? '');

        return estado.ascendente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      });

      return {
        data: registros.slice(desde, hasta + 1),
        error: null,
        count: registros.length,
      };
    }),
  };

  return consulta;
}

describe('P-08. Prueba de volumen', () => {
  it('pagina correctamente un conjunto masivo de 1000 productos sin devolver todo a la vez', async () => {
    const productos = crearProductosMasivos(1000);
    const supabaseService = {
      cliente: {
        from: jest.fn(() => crearConsultaProductos(productos)),
      },
    };
    const repositorio = new ProductosRepository(supabaseService as never);

    const respuesta = await repositorio.listarProductos({
      pagina: 3,
      limite: 10,
      campoBusqueda: 'nombre_producto',
      busqueda: 'PRODUCTO',
      estadoRegistro: 'activos',
    });

    expect(respuesta.registros).toHaveLength(10);
    expect(respuesta.paginacion.total).toBe(1000);
    expect(respuesta.paginacion.pagina).toBe(3);
    expect(respuesta.registros[0].codigo_producto).toBe('P-0980');
    expect(respuesta.registros[9].codigo_producto).toBe('P-0971');
  });
});
