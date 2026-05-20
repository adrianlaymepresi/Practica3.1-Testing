import { Module } from '@nestjs/common';
import { DetallePedidosRepository } from './detalle-pedidos.repository';
import { DetallePedidosService } from './detalle-pedidos.service';
import { PedidosCatalogosRepository } from './pedidos-catalogos.repository';
import { PedidosController } from './pedidos.controller';
import { PedidosRepository } from './pedidos.repository';
import { PedidosService } from './pedidos.service';

@Module({
  controllers: [PedidosController],
  providers: [
    PedidosService,
    DetallePedidosService,
    PedidosRepository,
    DetallePedidosRepository,
    PedidosCatalogosRepository,
  ],
})
export class PedidosModule {}
