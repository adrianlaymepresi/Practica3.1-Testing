import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ESTADOS_REGISTRO } from '../constants/validaciones.constant';
import type { EstadoRegistro } from '../constants/validaciones.constant';

export class PaginacionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limite?: number = 10;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloActivos?: boolean = true;

  @IsOptional()
  @IsIn(ESTADOS_REGISTRO)
  estadoRegistro?: EstadoRegistro = 'activos';

  @IsOptional()
  @IsString()
  @MaxLength(80)
  busqueda?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  campoBusqueda?: string;
}
