import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserConverter } from './converter/user.converter';
import { EmailService } from './service/mail.service';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from './cloudinary.module';
import { TokenService } from './service/token.service';
import { Services } from './entity/services';
import { ServiceService } from './service/service.service';
import { ServicesController } from './controller/services.controller';
import { ServiceConverter } from './converter/service.converter';
import { Priviledge} from './entity/privilege';
import { Role } from './entity/role';
import { RolePriviledge } from './entity/role_privilege';
import { FileController } from './controller/file.controller';
import { FileService } from './service/file.service';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Services,Role,Priviledge,RolePriviledge],
        synchronize: true,
        logging: true,
      }),
    }),

    TypeOrmModule.forFeature([User, Services]), // ✅ include Services here

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [UserController, AuthController, ServicesController, FileController],
  providers: [
    UserService,
    UserConverter,
    EmailService,
    AuthService,
    TokenService,
    FileService,
    ServiceService, ServiceConverter
  ],
})
export class AppModule {}
