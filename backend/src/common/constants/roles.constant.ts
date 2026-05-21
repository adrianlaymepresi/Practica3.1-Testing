export const ROLES_SISTEMA = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  AYUDANTE: 'AYUDANTE',
} as const;

export type RolSistema = (typeof ROLES_SISTEMA)[keyof typeof ROLES_SISTEMA];

export const ROLES_PANEL = [
  ROLES_SISTEMA.ADMINISTRADOR,
  ROLES_SISTEMA.AYUDANTE,
] as const;
