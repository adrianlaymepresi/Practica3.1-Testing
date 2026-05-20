import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { REGEX_CONTRASENIA_SIN_ESPACIOS } from '../../../common/constants/validaciones.constant';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsUUID()
  id_empleado?: string;

  @IsOptional()
  @IsUUID()
  id_rol?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(REGEX_CONTRASENIA_SIN_ESPACIOS, {
    message: 'La contrasenia no puede tener espacios y debe tener entre 8 y 72 caracteres',
  })
  contrasenia_usuario?: string;
}
