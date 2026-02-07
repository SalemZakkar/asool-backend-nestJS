import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthProvider } from './entities/auth.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FirebaseAppModule } from '../firebase_app/firebase-app.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthProvider]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    FirebaseAppModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy , AuthService],
})
export class AuthModule {}
