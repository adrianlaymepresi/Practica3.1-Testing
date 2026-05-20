import type { Metadata } from 'next';
import './globals.css';

const nombreAplicacion =
  process.env.NEXT_PUBLIC_APP_NOMBRE ?? 'PRACTICA 3.1 TESTING';

export const metadata: Metadata = {
  title: nombreAplicacion,
  description: 'Panel administrativo del sistema de pedidos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
