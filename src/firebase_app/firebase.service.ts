import { Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async verify(token: string) {
    let res = await this.firebase.auth.verifyIdToken(token);
    return { email: res.email, uid: res.uid, phone: res.phone_number , name: "User" };
  }
}
