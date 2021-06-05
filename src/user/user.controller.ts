import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/auth.guards';
import { AppResponse } from '../response/appResponse';
import { AppSuccess } from '../response/appSuccess';
import { UserView } from './user.schema';

@UseGuards(SessionAuthGuard)
@Controller('user')
export class UserController {
  @Get()
  getUser(@Req() req): AppResponse {
    const user: UserView = req.user;
    return new AppSuccess('user_success', `Hi ${user.name}`);
  }
}
