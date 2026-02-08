import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initialize, createErrorRequestHandler } from 'core';

async function bootstrap() {
  await initialize();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app
    .getHttpAdapter()
    .getInstance()
    .get('/api/errors', createErrorRequestHandler());
  await app.listen(process.env.PORT!);
}
bootstrap().then(() => console.log('STARTED'));
