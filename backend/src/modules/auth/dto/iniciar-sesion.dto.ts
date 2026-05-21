import { IsString, MaxLength, MinLength } from 'class-validator';

export class IniciarSesionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nombre_usuario: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  contrasenia: string;
}
