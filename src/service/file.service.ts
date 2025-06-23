import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result: UploadApiResponse) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }).end(file.buffer);
    });
  }

  async deleteFile(imageUrl: string): Promise<string> {
    try {
      // Extract public_id from URL
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        throw new Error('Invalid image URL');
      }

      // Call Cloudinary delete API
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete image: ${result.result}`);
      }

      return 'Image deleted successfully';
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Helper to extract public_id from URL
  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const fileNameWithExt = parts[parts.length - 1];
      const publicId = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));
      return publicId;
    } catch {
      return null;
    }
  }
}
