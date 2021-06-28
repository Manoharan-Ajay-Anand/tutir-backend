import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserView } from 'src/user/user.schema';
import { VideoNotFoundError } from '../video.error';
import { Video, VideoDocument, VideoView } from '../schema/video.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  convertToView(video: VideoDocument): VideoView {
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      notes: video.notes,
      tags: video.tags,
      owner: video.owner,
    };
  }

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
    });
    return video.save().then(this.convertToView);
  }

  async getVideos(): Promise<Array<VideoView>> {
    return this.videoModel
      .find()
      .exec()
      .then((videos) => videos.map(this.convertToView));
  }

  async getVideosByTags(tags: Array<string>): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ tags: { $in: tags } })
      .exec()
      .then((videos) => videos.map(this.convertToView));
  }

  async getVideosByOwner(ownerId: Types.ObjectId): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ 'owner.id': { $eq: ownerId } })
      .exec()
      .then((videos) => videos.map(this.convertToView));
  }

  getVideoById(id: Types.ObjectId): Promise<VideoView> {
    return this.videoModel
      .findById(id)
      .exec()
      .then((video) => {
        if (!video) {
          throw new VideoNotFoundError();
        }
        return this.convertToView(video);
      });
  }

  getVideosByIdList(idList: Array<Types.ObjectId>): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ _id: { $in: idList } })
      .exec()
      .then((videos) => {
        return videos.map(this.convertToView);
      });
  }

  getAllVideoTags(): Promise<Array<string>> {
    return this.videoModel
      .aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', number: { $sum: 1 } } },
        { $sort: { number: -1 } },
      ])
      .exec()
      .then((docs) => {
        return docs.map((doc) => doc._id);
      });
  }
}
