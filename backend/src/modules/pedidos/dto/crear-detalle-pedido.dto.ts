import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CrearDetallePedidoDto {
  @IsUUID()
  id_producto: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad_detalle_orden: number;
}
