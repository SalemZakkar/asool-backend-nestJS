import { FirebaseModule } from 'nestjs-firebase';
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
@Module({
  imports: [
    FirebaseModule.forRoot({
      googleApplicationCredential: 'asool-key.json',
    }),
  ],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseAppModule {}
