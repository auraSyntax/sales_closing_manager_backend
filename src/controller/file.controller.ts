import { Body, Controller, Delete, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/service/file.service';


@Controller('upload')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.fileService.uploadFile(file);
    return { imageUrl };
  }

  @Delete()
  async deleteFile(@Body('imageUrl') imageUrl: string) {
    const message = await this.fileService.deleteFile(imageUrl);
    return { message };
  }
}
