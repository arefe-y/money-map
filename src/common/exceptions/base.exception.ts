import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(message: string, statusCode: number) {
    super(
      {
        success: false,
        message,
      },
      statusCode,
    );
  }
}
