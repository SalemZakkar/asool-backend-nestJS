import { Column } from 'typeorm';

export class Phone {
  @Column()
  code: string;
  @Column()
  number: string;
}
