import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AppError } from 'src/response/appError';
import { UserView } from 'src/user/user.schema';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserView> {
    const user = await this.authService.validateUser(
      undefined,
      email,
      password,
    );
    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'auth_login_failed');
    }
    return user;
  }
}
