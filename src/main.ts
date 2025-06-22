import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './security/jwt-auth.guard';

async function bootstrap() {
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

  // Register global JWT guard
  app.useGlobalGuards(new JwtAuthGuard());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
