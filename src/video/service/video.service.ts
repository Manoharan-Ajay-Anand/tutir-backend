import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaService } from 'src/media/media.service';
import { UserView } from 'src/user/user.schema';
import { VideoNotFoundError } from '../video.error';
import { Video, VideoDocument, VideoView } from '../schema/video.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private mediaService: MediaService,
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
    videoFile: Express.Multer.File,
    thumbnail: Express.Multer.File,
    notes: Array<Express.Multer.File>,
    tags: Array<string>,
    user: UserView,
  ): Promise<VideoView> {
    const video_url = await this.mediaService.uploadFile(videoFile, 'video');
    const thumbnail_url = await this.mediaService.uploadFile(
      thumbnail,
      'thumbnail',
    );
    const notes_urls = await Promise.all(
      notes.map((note) => this.mediaService.uploadFile(note, 'notes')),
    );
    const video = new this.videoModel({
      title: title,
      description: description,
      url: video_url,
      thumbnailUrl: thumbnail_url,
      notes: notes_urls,
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

  async getVideosByTag(tag: string): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ tags: { $eq: tag } })
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
}
