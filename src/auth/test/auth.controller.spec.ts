import { AuthService } from '../auth.service';
import { LoginFailedError, UserExistsError } from '../auth.error';
import { AuthController } from '../auth.controller';
import { TestAuthService } from './auth.service.test';
import { LocalStrategy } from '../strategy/local.strategy';

describe('Auth', () => {
  let authService: AuthService;
  let authController: AuthController;
  let localStrategy: LocalStrategy;
  beforeAll(() => {
    authService = new TestAuthService();
    authController = new AuthController(authService);
    localStrategy = new LocalStrategy(authService);
  });
  describe('signUp', () => {
    it('should throw UserExistsError', () => {
      expect(
        authController.createUser('User', 'userexists@gmail.com', 'password'),
      ).rejects.toBeInstanceOf(UserExistsError);
    });
    it('should be successful', () => {
      expect(
        authController.createUser('User', 'user@gmail.com', 'password'),
      ).resolves.toMatchObject({ code: 'user_created' });
    });
  });
  describe('login', () => {
    it('should throw LoginFailedError', () => {
      expect(
        localStrategy.validate('user@gmail.com', 'wrong_password'),
      ).rejects.toBeInstanceOf(LoginFailedError);
    });
    it('should be successful', () => {
      expect(
        localStrategy.validate('user@gmail.com', 'correct_password'),
      ).resolves.toMatchObject({ email: 'user@gmail.com' });
    });
  });
});
