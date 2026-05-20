import { Module } from '@nestjs/common';
import { EmpleadosModule } from '../empleados/empleados.module';
import { RolesModule } from '../roles/roles.module';
import { UsuariosController } from './usuarios.controller';
import { UsuariosRepository } from './usuarios.repository';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [EmpleadosModule, RolesModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosRepository],
})
export class UsuariosModule {}
