import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CrearProductoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  codigo_producto: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nombre_producto: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion_producto?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_producto: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_producto: number;
}
