import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configurarAplicacion } from './configurar-aplicacion';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configurarAplicacion(app);

  const configService = app.get(ConfigService);
  const puerto = configService.get<number>('entorno.puerto') ?? 4001;

  await app.listen(puerto);
}
void bootstrap();
