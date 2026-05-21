import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class ActualizarPedidoDto {
  @IsOptional()
  @IsUUID()
  id_cliente?: string;

  @IsOptional()
  @IsDateString()
  fecha_orden_pedido?: string;

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
