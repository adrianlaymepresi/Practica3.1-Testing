import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ContenedorPagina } from '@/src/components/layout/ContenedorPagina';
import { accesoRapidoDashboard } from '@/src/lib/constants/rutas';

export default function DashboardPage() {
  return (
    <ContenedorPagina
      titulo="Dashboard"
      descripcion="Punto de entrada del panel administrativo del sistema de pedidos."
    >
      <section className="dashboard-resumen">
        <article className="dashboard-resumen__hero">
          <span className="panel-informativo__eyebrow">Primera etapa</span>
          <h3>Base administrativa lista para crecer por dominios</h3>
          <p>
            Ya queda montada la navegacion completa y el modulo de roles
            funcional. Los siguientes apartados continuaran con la misma
            arquitectura de WEBADMIN.
          </p>
        </article>

        <div className="dashboard-grid">
          {accesoRapidoDashboard.map((item) => {
            const Icono = item.icono;

            return (
              <Link className="tarjeta-dashboard" href={item.href} key={item.href}>
                <div className="tarjeta-dashboard__icono">
                  <Icono size={20} aria-hidden="true" />
                </div>
                <div className="tarjeta-dashboard__contenido">
                  <div className="tarjeta-dashboard__meta">
                    <strong>{item.titulo}</strong>
                    <span>{item.estado}</span>
                  </div>
                  <p>{item.descripcion}</p>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </ContenedorPagina>
  );
}
