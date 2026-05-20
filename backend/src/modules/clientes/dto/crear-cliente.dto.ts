import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  REGEX_CI_NUMERICO,
  REGEX_CORREO_ELECTRONICO,
  REGEX_NOMBRE_PERSONA,
  REGEX_TELEFONO_INTERNACIONAL,
} from '../../../common/constants/validaciones.constant';

export class CrearClienteDto {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(REGEX_CI_NUMERICO, {
    message: 'El CI debe contener solo numeros y tener entre 6 y 20 digitos',
  })
  ci_cliente: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Matches(REGEX_NOMBRE_PERSONA, {
    message: 'Los nombres deben contener solo letras y espacios',
  })
  nombres_completo_cliente: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Matches(REGEX_NOMBRE_PERSONA, {
    message: 'Los apellidos deben contener solo letras y espacios',
  })
  apellidos_completo_cliente: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(REGEX_TELEFONO_INTERNACIONAL, {
    message:
      'El telefono solo puede contener numeros y un signo + al inicio',
  })
  telefono_cliente?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(REGEX_CORREO_ELECTRONICO, {
    message: 'Debes ingresar un correo electronico valido',
  })
  correo_electronico_cliente?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion_cliente?: string;
}
