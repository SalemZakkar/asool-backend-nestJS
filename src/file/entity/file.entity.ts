import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storageName: string; // random filename on disk

  @Column()
  mimeType: string;

  @Column()
  size: number;
}
