import { AppResponse } from './appResponse';

export class AppSuccess extends AppResponse {
  constructor(code: string, payload?: any) {
    super(true, code, payload);
  }
}
