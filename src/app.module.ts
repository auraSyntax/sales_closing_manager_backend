// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserConverter } from './converter/user.converter';
import { EmailService } from './service/mail.service';
import { CloudinaryModule } from './cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [User],
          synchronize: true,
          logging: true,
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserConverter, EmailService],
})
export class AppModule {}