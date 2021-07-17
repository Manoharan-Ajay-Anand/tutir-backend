import { TestMediaService } from '../../media/test/media.service.test';
import { MediaService } from '../../media/media.service';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { TestUserService } from './user.service.test';
import { UserView } from '../user.schema';
import { Types } from 'mongoose';
import { InvalidParamsError } from '../../app.error';

const testUser: UserView = {
  id: new Types.ObjectId(),
  name: 'testUser',
  email: 'testUser@gmail.com',
  profileImageUrl: 'http://test.com/images/profileImage.jpeg',
  stripeConnected: false,
};

const testProfileImage: Express.Multer.File = {
  fieldname: null,
  filename: 'testProfileImage.jpeg',
  mimetype: 'image/jpeg',
  buffer: null,
  originalname: null,
  size: 0,
  stream: null,
  destination: 'testDir',
  encoding: null,
  path: 'testDir/testProfileImage.jpeg',
};

describe('User', () => {
  let userService: UserService;
  let mediaService: MediaService;
  let userController: UserController;
  beforeAll(() => {
    userService = new TestUserService();
    mediaService = new TestMediaService();
    userController = new UserController(userService, mediaService);
  });
  describe('changeName', () => {
    it('should throw InvalidParamsError', () => {
      expect(
        userController.changeName({ user: testUser }, null),
      ).rejects.toBeInstanceOf(InvalidParamsError);
    });
    it('should be successful', () => {
      expect(
        userController.changeName({ user: testUser }, 'newTestUser'),
      ).resolves.toMatchObject({
        payload: expect.objectContaining({ name: 'newTestUser' }),
      });
    });
  });
  describe('changeProfileImage', () => {
    it('should be successful', () => {
      expect(
        userController.uploadProfileImage({ user: testUser }, testProfileImage),
      ).resolves.toMatchObject({
        payload: expect.objectContaining({
          profileImageUrl: 'http://test.com/images/testProfileImage.jpeg',
        }),
      });
    });
  });
});
