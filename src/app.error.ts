import { HttpStatus } from '@nestjs/common';

export class AppError {
  status: number;
  code: string;
  payload: any;

  constructor(status: number, code: string, payload?: any) {
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export class InvalidParamsError extends AppError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, 'invalid_params');
  }
}
