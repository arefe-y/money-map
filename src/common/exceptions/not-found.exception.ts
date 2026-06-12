import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(entity: string) {
    super(`${entity} not found`, HttpStatus.NOT_FOUND);
  }
}
