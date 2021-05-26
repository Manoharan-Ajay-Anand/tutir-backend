import { HttpException } from '@nestjs/common';
import { AppResponse } from './appResponse';

export class AppError extends HttpException {
  constructor(status: number, code: string, payload?: any) {
    super(new AppResponse(false, code, payload), status);
  }
}
