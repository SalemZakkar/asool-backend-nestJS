import { Check, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserRoleEnum } from './user.role.enum';
@Index(['email'], { unique: true , where: `"email" IS NOT NULL` })
@Index(['username'], { unique: true , where: `"username" IS NOT NULL` })
@Index(['phoneCode', 'phoneNumber'], {
  unique: true,
  where: `"phoneCode" IS NOT NULL AND "phoneNumber" IS NOT NULL`,
})
@Check(
  `("phoneCode" IS NOT NULL AND "phoneNumber" IS NOT NULL) OR ("phoneCode" IS NULL AND "phoneNumber" IS NULL)`,
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
  @Column({ nullable: true, type: 'varchar', length: 4 })
  phoneCode?: string;
  @Column({ nullable: true, type: 'varchar', length: 9 })
  phoneNumber?: string;
  @Column({ type: 'enum', enum: Object.values(UserRoleEnum) })
  type: string;
}
