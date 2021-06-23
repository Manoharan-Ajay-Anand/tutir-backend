import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../app.error';
import { AppResponse } from '../response/appResponse';
import { AppSuccess } from '../response/appSuccess';
import { LocalAuthGuard, RefreshAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<AppResponse> {
    if (!name || !email || !password) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'invalid_params');
    }
    await this.authService.createUser(name, email, password);
    return new AppSuccess('user_created');
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(
    @Req() req,
    @Body('rememberMe') rememberMe: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const appSession = this.authService.createSession(user, rememberMe);
    if (rememberMe) {
      res.cookie('app-refresh-token', appSession.refresh.token, {
        httpOnly: true,
        path: '/auth/refresh',
        expires: new Date(appSession.refresh.expiry),
      });
    }
    return new AppSuccess('auth_login_success', appSession.session);
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refreshSession(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const appSession = this.authService.createSession(user, true);
    res.cookie('app-refresh-token', appSession.refresh.token, {
      httpOnly: true,
      path: '/auth/refresh',
      expires: new Date(appSession.refresh.expiry),
    });
    return new AppSuccess('auth_refresh_success', appSession.session);
  }
}
