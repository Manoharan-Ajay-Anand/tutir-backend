import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { AppErrorFilter } from './app-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AppErrorFilter());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.WEB_ORIGIN,
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
