import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthProviderType } from './enum/auth-provider.type';
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
  @Column({ type: 'enum', enum: Object.values(AuthProviderType) })
  type: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  user: User;
}
