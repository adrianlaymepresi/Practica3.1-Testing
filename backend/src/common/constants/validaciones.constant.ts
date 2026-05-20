export const ESTADOS_REGISTRO = ['activos', 'archivados', 'todos'] as const;

export type EstadoRegistro = (typeof ESTADOS_REGISTRO)[number];
