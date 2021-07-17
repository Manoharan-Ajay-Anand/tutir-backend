import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Types } from 'mongoose';
import { Strategy } from 'passport-jwt';
import { convertToUserView } from '../../user/user.schema';
import { UserService } from '../../user/user.service';

function cookieExtractor(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['app-refresh-token'];
  }
  return token;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: any) {
    const id: string = payload.id;
    const user = await this.userService.findOne(new Types.ObjectId(id));
    return convertToUserView(user);
  }
}
