import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileService {
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
    this.baseUrl = this.configService.get<string>('CLOUDINARY_BASE_URL')!; 
  }

async uploadFile(file: Express.Multer.File): Promise<{ imageUrl: string; imageUrlWithDomain: string }> {
  return new Promise((resolve, reject) => {
    const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
    const publicId = originalNameWithoutExt;

    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: publicId,
        overwrite: true,
      },
      (error, result: UploadApiResponse) => {
        if (error) {
          reject(error);
        } else {
          const baseUrl = this.baseUrl;
          const relativePath = result.secure_url.replace(baseUrl, '');

          resolve({
            imageUrl: relativePath,
            imageUrlWithDomain: result.secure_url,
          });
        }
      }
    ).end(file.buffer);
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
