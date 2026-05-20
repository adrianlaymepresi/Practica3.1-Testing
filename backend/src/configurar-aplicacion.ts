import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { FiltroGlobalExcepciones } from './common/filters/filtro-global-excepciones';
import { RespuestaInterceptor } from './common/interceptors/respuesta.interceptor';
import { crearExcepcionValidacion } from './common/utils/validacion.util';

export function configurarAplicacion(app: INestApplication) {
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('entorno.frontendUrl');
  const frontendUrlProduccion = configService.get<string>(
    'entorno.frontendUrlProduccion',
  );

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: [frontendUrl, frontendUrlProduccion].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: crearExcepcionValidacion,
    }),
  );
  app.useGlobalFilters(new FiltroGlobalExcepciones());
  app.useGlobalInterceptors(new RespuestaInterceptor());
}
