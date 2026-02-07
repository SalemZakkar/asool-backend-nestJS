import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OtpReasonEnum } from './enum/otpreason.enum';
import { OtpChannelEnum } from './enum/otpchannel.enum';
import { User } from '../../user/entities/user.entity';

@Entity()
@Index(['user', 'reason', 'channel'], { unique: true })
@Check('attempts', `attempts >= 1 AND attempts <= 5`)
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 6 })
  code: string;
  @Column({ type: 'enum', enum: Object.values(OtpReasonEnum) })
  reason: string;
  @Column({ type: 'enum', enum: Object.values(OtpChannelEnum) })
  channel: string;
  @ManyToOne(() => User, (user: User) => user.id)
  user: User;
  @Column({
    type: 'int',
    default: 1,
  })
  attempts: number;
  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  static SEPS = [5, 10, 20, 60, 24 * 60];
  static MAX_ATTEMPTS = 5;

  nextDate() {
    let res = new Date(this.date);
    res.setMinutes(res.getMinutes() + Otp.SEPS[this.attempts - 1]);
    return res;
  }

  canResend() {
    let next = this.nextDate();
    let now = new Date();
    return now >= next;
  }
}
