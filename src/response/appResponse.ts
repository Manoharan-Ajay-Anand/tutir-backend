export class AppResponse {
  success: boolean;
  code: string;
  payload: any;

  constructor(success: boolean, code: string, payload: any) {
    this.success = success;
    this.code = code;
    this.payload = payload;
  }
}
