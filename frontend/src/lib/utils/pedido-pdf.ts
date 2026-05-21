import { DetallePedido, Pedido } from '@/src/types/pedidos.types';
import {
  formatearMontoPedido,
  obtenerNombreClientePedido,
  obtenerNombreEmpleadoPedido,
  obtenerNombreProductoPedido,
} from '@/src/lib/utils/pedidos';
import { formatearFechaHoraZonaHoraria } from '@/src/lib/utils/fechas';

const NOMBRE_APLICACION =
  process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';

function escaparTextoPdf(valor: string) {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\xFF]/g, ' ');
}

function dividirTexto(valor: string, maximo = 74) {
  const palabras = valor.trim().split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let lineaActual = '';

  for (const palabra of palabras) {
    const candidata = lineaActual ? `${lineaActual} ${palabra}` : palabra;

    if (candidata.length <= maximo) {
      lineaActual = candidata;
      continue;
    }

    if (lineaActual) {
      lineas.push(lineaActual);
    }

    lineaActual = palabra;
  }

  if (lineaActual) {
    lineas.push(lineaActual);
  }

  return lineas.length > 0 ? lineas : [''];
}

function construirObjetosPdf(paginas: string[]) {
  const objetos: string[] = [];
  const totalObjetos = 3 + paginas.length * 2;
  const indiceFuente = totalObjetos;
  const referenciasPaginas: string[] = [];

  objetos.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  for (let indice = 0; indice < paginas.length; indice += 1) {
    const numeroPagina = 3 + indice * 2;
    const numeroContenido = numeroPagina + 1;

    referenciasPaginas.push(`${numeroPagina} 0 R`);
    objetos.push(
      `${numeroPagina} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${indiceFuente} 0 R >> >> /Contents ${numeroContenido} 0 R >>\nendobj`,
    );
    objetos.push(
      `${numeroContenido} 0 obj\n<< /Length ${paginas[indice].length} >>\nstream\n${paginas[indice]}\nendstream\nendobj`,
    );
  }

  objetos.splice(
    1,
    0,
    `2 0 obj\n<< /Type /Pages /Count ${paginas.length} /Kids [${referenciasPaginas.join(
      ' ',
    )}] >>\nendobj`,
  );
  objetos.push(
    `${indiceFuente} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
  );

  return objetos;
}

function construirDocumentoPdf(lineas: string[]) {
  const paginas: string[] = [];
  const maximoLineasPorPagina = 42;

  for (
    let indicePagina = 0;
    indicePagina < lineas.length;
    indicePagina += maximoLineasPorPagina
  ) {
    const bloque = lineas.slice(indicePagina, indicePagina + maximoLineasPorPagina);
    const contenido = [
      'BT',
      '/F1 11 Tf',
      '40 800 Td',
      '16 TL',
      ...bloque.map((linea, indice) =>
        indice === 0
          ? `(${escaparTextoPdf(linea)}) Tj`
          : `T* (${escaparTextoPdf(linea)}) Tj`,
      ),
      'ET',
    ].join('\n');

    paginas.push(contenido);
  }

  const objetos = construirObjetosPdf(paginas);
  let documento = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const objeto of objetos) {
    offsets.push(documento.length);
    documento += `${objeto}\n`;
  }

  const inicioXref = documento.length;
  documento += `xref\n0 ${offsets.length}\n`;
  documento += '0000000000 65535 f \n';

  for (let indice = 1; indice < offsets.length; indice += 1) {
    documento += `${String(offsets[indice]).padStart(10, '0')} 00000 n \n`;
  }

  documento += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;

  return documento;
}

export function descargarReciboPedidoPdf(
  pedido: Pedido,
  detalles: DetallePedido[],
) {
  const lineas: string[] = [
    NOMBRE_APLICACION,
    'RECIBO DE VENTA',
    '----------------------------------------------------------------',
    `Pedido: ${pedido.codigo_orden_pedido}`,
    `Fecha programada: ${formatearFechaHoraZonaHoraria(pedido.fecha_orden_pedido)}`,
    `Estado: ${pedido.estado_orden_pedido}`,
    `Cliente: ${obtenerNombreClientePedido(pedido.cliente)}`,
    `Empleado: ${obtenerNombreEmpleadoPedido(pedido.empleado)}`,
    `Observacion: ${pedido.observacion_orden_pedido ?? 'Sin observacion'}`,
    '----------------------------------------------------------------',
    'DETALLE',
  ];

  detalles.forEach((detalle, indice) => {
    const descripcion = `${indice + 1}. ${obtenerNombreProductoPedido(
      detalle.producto,
    )}`;
    const resumen = `Cantidad: ${detalle.cantidad_detalle_orden}  |  Unitario: ${formatearMontoPedido(
      detalle.precio_unitario_detalle_orden,
    )}  |  Subtotal: ${formatearMontoPedido(detalle.subtotal_detalle_orden)}`;

    lineas.push(...dividirTexto(descripcion));
    lineas.push(...dividirTexto(resumen));
    lineas.push(' ');
  });

  lineas.push('----------------------------------------------------------------');
  lineas.push(`Subtotal: ${formatearMontoPedido(pedido.subtotal_orden_pedido)}`);
  lineas.push(`Descuento: ${formatearMontoPedido(pedido.descuento_orden_pedido)}`);
  lineas.push(`Total: ${formatearMontoPedido(pedido.total_orden_pedido)}`);

  const contenidoPdf = construirDocumentoPdf(lineas);
  const blob = new Blob([contenidoPdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = `recibo-${pedido.codigo_orden_pedido.toLowerCase()}.pdf`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
