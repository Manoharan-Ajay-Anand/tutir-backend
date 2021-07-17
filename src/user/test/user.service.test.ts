import { Types } from 'mongoose';
import { UserView } from '../user.schema';
import { UserService } from '../user.service';

export class TestUserService extends UserService {
  constructor() {
    super(null);
  }

  changeName(id: Types.ObjectId, name: string): Promise<UserView> {
    return Promise.resolve({
      id: id,
      name: name,
      email: 'testuser@gmail.com',
      profileImageUrl: null,
      stripeConnected: false,
    });
  }

  changeProfileImage(
    id: Types.ObjectId,
    profileImageUrl: string,
  ): Promise<UserView> {
    return Promise.resolve({
      id: id,
      name: 'testUser',
      email: 'testuser@gmail.com',
      profileImageUrl: profileImageUrl,
      stripeConnected: false,
    });
  }
}
