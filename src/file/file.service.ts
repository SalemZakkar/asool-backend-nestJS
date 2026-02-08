import { promises as fs } from 'node:fs';
import * as path from 'path';
import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entity/file.entity';

@Injectable()
export class FileService {
  private basePath = path.resolve(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(File) private readonly repo: Repository<File>,
  ) {}
  async store(
    file: Express.Multer.File,
    parent?: string,
    repo?: Repository<File>,
  ) {
    const repository = repo || this.repo;

    const safeParent = parent?.replace(/[^a-zA-Z0-9_-]/g, '') || '';

    const storageName = randomUUID();
    const ext = path.extname(file.originalname || '');
    const filename = storageName + ext;

    const fullDir = path.join(this.basePath, safeParent);
    const fullPath = path.join(fullDir, filename);

    await fs.mkdir(fullDir, { recursive: true });

    try {
      await fs.writeFile(fullPath, file.buffer);

      const entity = repository.create({
        storageName: path.join(safeParent, filename), // store relative path in DB
        mimeType: file.mimetype,
        size: file.size,
      });

      return await repository.save(entity);
    } catch (err) {
      // cleanup on failure
      await fs.unlink(fullPath).catch(() => null);
      throw err;
    }
  }

  async getById(id: string) {
    const file = await this.repo.findOne({ where: { id } });
    if (!file) throw new NotFoundException();

    const fullPath = path.join(this.basePath, file.storageName);

    if (!(await fs.stat(fullPath).catch(() => null))) {
      await this.repo.delete({ id });
      throw new NotFoundException();
    }

    return { ...file, fullPath };
  }

  async delete(id: string, repo?: Repository<File>) {
    const repository = repo || this.repo;

    const file = await repository.findOne({ where: { id } });
    if (!file) return false;

    const fullPath = path.join(this.basePath, file.storageName);

    await repository.delete({ id });
    await fs.unlink(fullPath).catch(() => null);

    return true;
  }

  async replace(
    oldFileId: string,
    newFile: Express.Multer.File,
    parent?: string | undefined,
    repo?: Repository<File>,
  ) {
    const repository = repo || this.repo;
    await this.delete(oldFileId, repository);
    return await this.store(newFile, parent, repository);
  }
}
