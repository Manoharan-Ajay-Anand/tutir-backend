import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserView } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  convertToView(user: UserDocument): UserView {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };
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

  async findOne(id?: Types.ObjectId, email?: string): Promise<UserDocument> {
    if (id) {
      return await this.userModel.findById(id).exec();
    } else if (email) {
      return await this.userModel.findOne({ email: email }).exec();
    } else {
      throw Error('UserService findOne invalid params');
    }
  }

  changeName(id: Types.ObjectId, name: string): Promise<UserView> {
    return this.userModel
      .findByIdAndUpdate(id, { name: name }, { new: true })
      .exec()
      .then(this.convertToView);
  }

  changeProfileImage(
    id: Types.ObjectId,
    profileImageUrl: string,
  ): Promise<UserView> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { profileImageUrl: profileImageUrl },
        { new: true },
      )
      .exec()
      .then(this.convertToView);
  }

  async addFavouriteVideo(userId: Types.ObjectId, videoId: Types.ObjectId) {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { favourites: videoId },
    });
  }
}
