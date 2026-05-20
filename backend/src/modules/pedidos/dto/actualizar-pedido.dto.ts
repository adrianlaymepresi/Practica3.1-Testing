import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ActualizarPedidoDto {
  @IsOptional()
  @IsUUID()
  id_cliente?: string;

  @IsOptional()
  @IsUUID()
  id_empleado?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  codigo_orden_pedido?: string;

  @IsOptional()
  @IsDateString()
  fecha_orden_pedido?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  estado_orden_pedido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  observacion_orden_pedido?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuento_orden_pedido?: number;
}
