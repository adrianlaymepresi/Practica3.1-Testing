import { SetMetadata } from '@nestjs/common';

export const CLAVE_RUTA_PUBLICA = 'ruta_publica';

export const Publico = () => SetMetadata(CLAVE_RUTA_PUBLICA, true);
