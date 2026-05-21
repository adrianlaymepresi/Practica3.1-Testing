'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Package2 } from 'lucide-react';
import { Boton } from '@/src/components/comunes/Boton';
import { InputContrasenia } from '@/src/components/comunes/InputContrasenia';
import { InputTexto } from '@/src/components/comunes/InputTexto';
import { MensajeError } from '@/src/components/comunes/MensajeError';
import { obtenerRutaInicioPorRol } from '@/src/lib/auth/permisos';
import { normalizarContrasenia } from '@/src/lib/utils/formularios';
import { obtenerMensajeError } from '@/src/lib/utils/errores';
import { iniciarSesion } from '@/src/services/auth.service';

function normalizarNombreUsuarioIngreso(valor: string) {
  return valor
    .toLocaleUpperCase('es-BO')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 120);
}

export default function LoginPage() {
  const router = useRouter();
  const nombreApp =
    process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const sesion = await iniciarSesion({
        nombre_usuario: nombreUsuario.trim().toUpperCase(),
        contrasenia,
      });

      router.replace(obtenerRutaInicioPorRol(sesion.rol));
      router.refresh();
    } catch (errorDesconocido) {
      setError(
        obtenerMensajeError(
          errorDesconocido,
          'No se pudo iniciar sesion en este momento',
        ),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <section className="login__presentacion">
        <div className="login__marca">
          <Package2 size={28} aria-hidden="true" />
          <span>{nombreApp}</span>
        </div>
        <h1>Gestion interna de pedidos con autenticacion real.</h1>
        <p>
          Inicia sesion con tu usuario del sistema para entrar al panel segun
          el rol que tengas asignado.
        </p>
      </section>

      <section className="login__panel" aria-label="Ingreso al panel">
        <form className="login__formulario" onSubmit={manejarEnvio}>
          <div>
            <span className="login__eyebrow">Acceso al sistema</span>
            <h2>Iniciar sesion</h2>
          </div>
          <p className="login__mensaje">
            Usa el nombre de usuario generado por el sistema y la contrasenia
            que tenga registrada tu cuenta.
          </p>
          {error ? <MensajeError mensaje={error} /> : null}
          <div className="formulario formulario-grid">
            <InputTexto
              etiqueta="Nombre de usuario"
              ayuda="Obligatorio. Se convierte a mayusculas y no admite espacios."
              name="nombre_usuario"
              value={nombreUsuario}
              placeholder="USUARIO"
              maxLength={120}
              autoComplete="username"
              required
              onChange={(evento) =>
                setNombreUsuario(
                  normalizarNombreUsuarioIngreso(evento.target.value),
                )
              }
            />
            <InputContrasenia
              etiqueta="Contrasenia"
              ayuda="Obligatorio. Ingresa la contrasenia registrada para tu usuario."
              name="contrasenia"
              value={contrasenia}
              placeholder="********"
              autoComplete="current-password"
              required
              onChange={(evento) =>
                setContrasenia(normalizarContrasenia(evento.target.value, 255))
              }
            />
          </div>
          <Boton
            type="submit"
            icono={<ArrowRight size={18} />}
            cargando={enviando}
          >
            Entrar al panel principal
          </Boton>
        </form>
      </section>
    </main>
  );
}
