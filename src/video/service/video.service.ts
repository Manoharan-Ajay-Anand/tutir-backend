import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserView } from '../../user/user.schema';
import { VideoNotFoundError } from '../video.error';
import {
  Video,
  VideoDocument,
  VideoView,
  convertToVideoView,
} from '../schema/video.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async createVideo(
    title: string,
    description: string,
    videoUrl: string,
    thumbnailUrl: string,
    notesUrlList: Array<string>,
    tags: Array<string>,
    user: UserView,
  ): Promise<VideoView> {
    const video = new this.videoModel({
      title: title,
      description: description,
      url: videoUrl,
      thumbnailUrl: thumbnailUrl,
      notes: notesUrlList,
      tags: tags,
      owner: {
        id: user.id,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
      canTip: user.stripeConnected,
    });
    return video.save().then(convertToVideoView);
  }

  async deleteVideo(id: Types.ObjectId, ownerId: Types.ObjectId) {
    const query = await this.videoModel
      .deleteOne({
        _id: { $eq: id },
        'owner.id': { $eq: ownerId },
      })
      .exec();
    if (query.deletedCount !== 1) {
      throw new VideoNotFoundError();
    }
  }

  async incrementView(videoId: Types.ObjectId) {
    const query = await this.videoModel
      .updateOne({ _id: { $eq: videoId } }, { $inc: { views: 1 } })
      .exec();
    if (query.nModified !== 1) {
      throw new VideoNotFoundError();
    }
  }

  async incrementComment(videoId: Types.ObjectId) {
    const query = await this.videoModel
      .updateOne({ _id: { $eq: videoId } }, { $inc: { comments: 1 } })
      .exec();
    if (query.nModified !== 1) {
      throw new VideoNotFoundError();
    }
  }

  async getVideosByOwner(ownerId: Types.ObjectId): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ 'owner.id': { $eq: ownerId } })
      .exec()
      .then((videos) => videos.map(convertToVideoView));
  }

  getVideoById(id: Types.ObjectId): Promise<VideoDocument> {
    return this.videoModel
      .findById(id)
      .exec()
      .then((video) => {
        if (!video) {
          throw new VideoNotFoundError();
        }
        return video;
      });
  }

  getVideosByIdList(idList: Array<Types.ObjectId>): Promise<Array<VideoView>> {
    return Promise.all(
      idList.map((id) => {
        return this.getVideoById(id)
          .then(convertToVideoView)
          .catch(() => null);
      }),
    ).then((videos) => videos.filter((video) => video));
  }
}
