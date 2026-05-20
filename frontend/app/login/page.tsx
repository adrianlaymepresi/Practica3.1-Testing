'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Package2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';

export default function LoginPage() {
  const router = useRouter();
  const nombreApp =
    process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';

  return (
    <main className="login">
      <section className="login__presentacion">
        <div className="login__marca">
          <Package2 size={28} aria-hidden="true" />
          <span>{nombreApp}</span>
        </div>
        <h1>Gestion interna de pedidos con estructura profesional.</h1>
        <p>
          Esta primera fase deja listo el panel administrativo con la misma
          arquitectura, estilo y convenciones de WEBADMIN, pero adaptado al
          sistema de pedidos.
        </p>
      </section>

      <section className="login__panel" aria-label="Ingreso al panel">
        <div className="login__formulario">
          <div>
            <span className="login__eyebrow">Acceso temporal</span>
            <h2>Ingresar al sistema</h2>
          </div>
          <p className="login__mensaje">
            Por ahora el ingreso es visual y temporal. La autenticacion real
            con JWT y cookies se integrara en la segunda etapa.
          </p>
          <Boton
            type="button"
            icono={<ArrowRight size={18} />}
            onClick={() => router.push('/dashboard')}
          >
            Entrar al panel principal
          </Boton>
        </div>
      </section>
    </main>
  );
}
