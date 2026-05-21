import { SetMetadata } from '@nestjs/common';
import { RolSistema } from '../constants/roles.constant';

export const CLAVE_ROLES_PERMITIDOS = 'roles_permitidos';

export const RolesPermitidos = (...roles: RolSistema[]) =>
  SetMetadata(CLAVE_ROLES_PERMITIDOS, roles);
