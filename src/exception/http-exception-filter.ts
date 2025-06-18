import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import { ServiceException } from './service-exception';

interface ApiError {
  status: number;
  message: string;
  errors: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let apiError: ApiError;

    if (exception instanceof ServiceException) {
      status = exception.getStatus();
      apiError = {
        status,
        message: exception.headerMessage,
        errors: exception.errors,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      const errors = Array.isArray(res.message) ? res.message : [res.message];
      apiError = {
        status,
        message: res.error || 'HTTP Exception',
        errors,
      };
    } else if (exception instanceof MulterError) {
      // for file size limit exceptions
      status = HttpStatus.BAD_REQUEST;
      apiError = {
        status,
        message: 'File Upload Error',
        errors: [exception.message],
      };
    } else {
      apiError = {
        status,
        message: 'Internal Server Error',
        errors: ['Internal Service Exception'],
      };
    }

    response.status(status).json(apiError);
  }
}
