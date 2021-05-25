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
import { AppError } from 'src/response/appError';
import { AppResponse } from 'src/response/appResponse';
import { AppSuccess } from 'src/response/appSuccess';
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
  async loginUser(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const appSession = this.authService.createSession(user);
    res.cookie('app-refresh-token', appSession.refresh, {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
    return new AppSuccess('auth_login_success', appSession.session);
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refreshSession(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const appSession = this.authService.createSession(user);
    res.cookie('app-refresh-token', appSession.refresh, {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
    return new AppSuccess('auth_refresh_success', appSession.session);
  }
}
