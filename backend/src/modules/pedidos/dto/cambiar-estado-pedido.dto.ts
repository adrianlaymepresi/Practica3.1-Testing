import { IsIn, IsString } from 'class-validator';

export class CambiarEstadoPedidoDto {
  @IsString()
  @IsIn(['COMPLETADO', 'CANCELADO'])
  estado_orden_pedido: string;
}
