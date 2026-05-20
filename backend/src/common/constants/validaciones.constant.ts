export const ESTADOS_REGISTRO = ['activos', 'archivados', 'todos'] as const;

export type EstadoRegistro = (typeof ESTADOS_REGISTRO)[number];

export const REGEX_CI_NUMERICO = /^[0-9]{6,20}$/;
export const REGEX_CORREO_ELECTRONICO =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const REGEX_NOMBRE_PERSONA =
  /^[A-Za-z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F1 ]{3,120}$/;
export const REGEX_TELEFONO_INTERNACIONAL = /^\+?[0-9]{7,20}$/;
export const REGEX_CONTRASENIA_SIN_ESPACIOS = /^\S{8,72}$/;
