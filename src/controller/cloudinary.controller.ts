// src/cloudinary/cloudinary.controller.ts
import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  MaxFileSizeValidator,
  ParseFilePipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../service/cloudinary.service';

@Controller('images')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      })
    ) file: Express.Multer.File,
  ) {
    try {
      // Check file type
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
      }

      const result = await this.cloudinaryService.uploadImage(file);
      return {
        success: true,
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      };
    } catch (error) {
      throw new HttpException(
        'Failed to upload image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}