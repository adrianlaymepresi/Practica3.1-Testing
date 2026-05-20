import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearRolDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nombre_rol: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion_rol?: string;

  @IsOptional()
  @IsBoolean()
  es_activo_rol?: boolean;
}
