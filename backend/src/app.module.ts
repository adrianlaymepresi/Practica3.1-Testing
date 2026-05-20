import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuracionEntorno from './common/config/configuracion.entorno';
import { validarEntorno } from './common/config/esquema.entorno';
import { SupabaseModule } from './common/database/supabase.module';
import { RolesModule } from './modules/roles/roles.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
