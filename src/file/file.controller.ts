import {
  Controller,
  Get,
  Delete,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.fileService.getById(id);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', 'inline');

    const stream = require('fs').createReadStream(file.fullPath);
    stream.pipe(res);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    const deleted = await this.fileService.delete(id);
    if (!deleted) throw new NotFoundException();
    return { success: true };
  }
}
