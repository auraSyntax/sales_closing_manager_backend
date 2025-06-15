import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Debug environment variables
  console.log('=== Environment Variables Debug ===');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
  console.log('===================================');

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();