import { Module } from '@nestjs/common';
import { EmpleadosController } from './empleados.controller';
import { EmpleadosRepository } from './empleados.repository';
import { EmpleadosService } from './empleados.service';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService, EmpleadosRepository],
  exports: [EmpleadosRepository],
})
export class EmpleadosModule {}
