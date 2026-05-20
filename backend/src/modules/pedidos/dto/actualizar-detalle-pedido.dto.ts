import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class ActualizarDetallePedidoDto {
  @IsOptional()
  @IsUUID()
  id_producto?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad_detalle_orden?: number;
}
