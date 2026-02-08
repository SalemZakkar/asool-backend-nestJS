import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entity/file.entity';
import { FileService } from './file.service';
import { FileController } from './file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService]
})
export class FileModule {}
