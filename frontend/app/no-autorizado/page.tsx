import Link from 'next/link';
import { LockKeyhole, ShieldAlert } from 'lucide-react';

export default function NoAutorizadoPage() {
  return (
    <main className="login">
      <section className="login__presentacion">
        <div className="login__marca">
          <ShieldAlert size={28} aria-hidden="true" />
          <span>Acceso restringido</span>
        </div>
        <h1>No tienes permisos para entrar a este apartado.</h1>
        <p>
          Tu sesion sigue activa, pero el rol asignado a tu usuario no puede
          usar esta ruta del panel.
        </p>
      </section>

      <section className="login__panel" aria-label="Sin autorizacion">
        <div className="login__formulario">
          <div>
            <span className="login__eyebrow">Permisos del sistema</span>
            <h2>Vuelve a una seccion habilitada</h2>
          </div>
          <p className="login__mensaje">
            Si crees que deberias tener acceso, revisa el rol asignado a tu
            usuario.
          </p>
          <Link className="boton boton--primario enlace-boton" href="/">
            <LockKeyhole size={18} aria-hidden="true" />
            <span>Ir a mi panel</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
