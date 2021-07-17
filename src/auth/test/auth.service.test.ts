import { Types } from 'mongoose';
import { UserView } from '../../user/user.schema';
import { LoginFailedError, UserExistsError } from '../auth.error';
import { AppSession, AuthService } from '../auth.service';

export class TestAuthService extends AuthService {
  constructor() {
    super(null, null);
  }

  async createUser(name: string, email: string, password: string) {
    if (email === 'userexists@gmail.com') {
      throw new UserExistsError();
    }
  }

  async validateUser(
    id: Types.ObjectId,
    email: string,
    password: string,
  ): Promise<UserView> {
    if (password !== 'correct_password') {
      throw new LoginFailedError();
    }
    return {
      id: new Types.ObjectId(),
      name: 'user',
      email: email,
      profileImageUrl: null,
      stripeConnected: false,
    };
  }

  createSession(user: any): AppSession {
    return {
      refresh: {
        token: 'test-token',
        expiry: 123,
      },
      session: {
        token: 'test-token',
        expiry: 123,
        refreshExpiry: 123,
      },
      user: user,
    };
  }
}
