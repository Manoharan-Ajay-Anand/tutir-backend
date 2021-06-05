import { UserView } from '../../user/user.schema';
import { LoginFailedError, UserExistsError } from '../auth.error';
import { AppSession, AuthService } from '../auth.service';

export class TestAuthService extends AuthService {
  async createUser(name: string, email: string, password: string) {
    if (email === 'userexists@gmail.com') {
      throw new UserExistsError();
    }
  }

  async validateUser(
    id: string,
    email: string,
    password: string,
  ): Promise<UserView> {
    if (password !== 'correct_password') {
      throw new LoginFailedError();
    }
    return { id: '123', name: 'user', email: email };
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
        user: user,
      },
    };
  }
}
