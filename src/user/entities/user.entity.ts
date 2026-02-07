import {
  Check,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
import { UserRoleType } from './user-role.type';
import { AuthProvider } from '../../auth/entities/auth.entity';
import { AuthProviderType } from '../../auth/entities/enum/auth-provider.type';
@Index(['email'], { unique: true, where: `"email" IS NOT NULL` })
@Index(['username'], { unique: true, where: `"username" IS NOT NULL` })
@Index(['phone'], {
  unique: true,
  where: `"phone" IS NOT NULL`,
})
@Check(
  `("email" IS NOT NULL AND "username" IS NULL) OR ("email" IS NULL AND "username" IS NOT NULL)`,
)
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  username: string;
  @Column({ nullable: true })
  phone?: string;
  @Column({ type: 'enum', enum: Object.values(UserRoleType) })
  type: string;
  @Column({
    type: 'boolean',
    default: false,
  })
  isEmailVerified: boolean;

  @OneToMany(() => AuthProvider, (auth) => auth.user, { eager: true })
  @Transform((v) => {
    return v.value.map((e: AuthProvider) => e.type);
  })
  authProviders: AuthProvider[];

  get hasPassword(): boolean {
    return (
      this.authProviders.filter((e) => e.type == AuthProviderType.password)
        .length > 0
    );
  };
}
