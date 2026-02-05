import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthProviderTypeEnum } from './enum/authprovider.type.enum';
import { User } from '../../user/entities/user.entity';

@Entity()
@Index(['user', 'type'], { unique: true })
@Index(['googleAccount'], {
  unique: true,
  where: `"googleAccount" IS NOT NULL`,
})
@Check(`
  ("type" = 'password' AND "passwordHash" IS NOT NULL AND "googleAccount" IS NULL)
  OR
  ("type" = 'google' AND "googleAccount" IS NOT NULL AND "passwordHash" IS NULL)
`)
export class AuthProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  googleAccount: string;
  @Column({ nullable: true })
  passwordHash: string;
  @Column({ type: 'enum', enum: Object.values(AuthProviderTypeEnum) })
  type: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  user: User;
}
