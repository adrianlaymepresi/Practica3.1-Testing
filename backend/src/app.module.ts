import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuracionEntorno from './common/config/configuracion.entorno';
import { validarEntorno } from './common/config/esquema.entorno';
import { SupabaseModule } from './common/database/supabase.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuracionEntorno],
      validate: validarEntorno,
    }),
    SupabaseModule,
    RolesModule,
    EmpleadosModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
