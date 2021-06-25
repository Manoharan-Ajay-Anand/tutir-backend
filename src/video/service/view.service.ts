import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserView } from 'src/user/user.schema';
import { View, ViewDocument } from '../schema/view.schema';

@Injectable()
export class ViewService {
  constructor(@InjectModel(View.name) private viewModel: Model<ViewDocument>) {}

  async addView(videoId: Types.ObjectId, user: UserView) {
    const view = new this.viewModel({
      videoId: videoId,
      viewerId: user.id,
    });
    await view.save();
  }

  async getViewedVideoIdList(user: UserView): Promise<Array<Types.ObjectId>> {
    return this.viewModel
      .distinct('videoId', { viewerId: { $eq: user.id } })
      .exec();
  }
}
