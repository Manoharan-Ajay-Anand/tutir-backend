import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VideoDocument } from '../../video/schema/video.schema';
import { Tip, TipDocument } from '../tip.schema';

@Injectable()
export class TipService {
  constructor(@InjectModel(Tip.name) private tipModel: Model<TipDocument>) {}

  async createTip(
    id: Types.ObjectId,
    amount: number,
    applicationFee: number,
    payerId: Types.ObjectId,
    video: VideoDocument,
    paymentIntentId: string,
  ) {
    const tipModel = new this.tipModel({
      _id: id,
      amount: amount,
      applicationFee: applicationFee,
      payerId: payerId,
      video: {
        id: video._id,
        title: video.title,
      },
      payee: {
        id: video.owner.id,
        name: video.owner.name,
        profileImageUrl: video.owner.profileImageUrl,
      },
      paymentIntentId: paymentIntentId,
      confirmed: false,
    });
    await tipModel.save();
  }

  findTip(id: Types.ObjectId): Promise<TipDocument> {
    return this.tipModel.findById(id).exec();
  }

  async cancelTip(id: Types.ObjectId) {
    const result = await this.tipModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount != 1) {
      throw Error(`Error canceling tip: ${id}`);
    }
  }

  async updateTipStatus(id: Types.ObjectId, confirmed: boolean) {
    const result = await this.tipModel.updateOne(
      { _id: { $eq: id } },
      { $set: { confirmed: confirmed } },
    );
    if (result.nModified != 1) {
      console.log('Error updating tip status');
    }
  }
}
