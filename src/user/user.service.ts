import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserView } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  convertToView(user: UserDocument): UserView {
    return { id: user.id, name: user.name, email: user.email };
  }

  createUser(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<UserDocument> {
    const user = new this.userModel({
      name: name,
      email: email,
      passwordHash: passwordHash,
    });
    return user.save();
  }

  async findOne(id?: string, email?: string): Promise<UserDocument> {
    if (id) {
      return await this.userModel.findById(id).exec();
    } else if (email) {
      return await this.userModel.findOne({ email: email }).exec();
    } else {
      throw Error('UserService findOne invalid params');
    }
  }
}
