import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { convertToUserView, User, UserDocument, UserView } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
      .then(convertToUserView);
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
      .then(convertToUserView);
  }

  async addFavouriteVideo(userId: Types.ObjectId, videoId: Types.ObjectId) {
    await this.userModel
      .updateOne({ _id: userId }, { $addToSet: { favourites: videoId } })
      .exec();
  }

  async updateConnectAccount(
    userId: Types.ObjectId,
    accountId: string,
    enabled: boolean,
  ) {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          $set: {
            'connectAccount.id': accountId,
            'connectAccount.enabled': enabled,
          },
        },
      )
      .exec();
  }

  async deactivateConnectAccount(accountId: string) {
    await this.userModel
      .updateOne(
        { 'connectAccount.id': accountId },
        {
          $set: {
            'connectAccount.id': null,
            'connectAccount.enabled': false,
          },
        },
      )
      .exec();
  }
}
