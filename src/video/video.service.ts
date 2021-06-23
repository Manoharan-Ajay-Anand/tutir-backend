import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaService } from 'src/media/media.service';
import { UserView } from 'src/user/user.schema';
import { VideoNotFoundError } from './video.error';
import { Video, VideoDocument, VideoView } from './video.schema';

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
      notes: video.notes,
      owner: video.owner,
    };
  }

  async createVideo(
    title: string,
    description: string,
    videoFile: Express.Multer.File,
    notes: Array<Express.Multer.File>,
    user: UserView,
  ): Promise<VideoDocument> {
    const video_url = await this.mediaService.uploadFile(videoFile, 'video');
    const notes_urls = await Promise.all(
      notes.map((note) => this.mediaService.uploadFile(note, 'notes')),
    );
    const video = new this.videoModel({
      title: title,
      description: description,
      url: video_url,
      notes: notes_urls,
      owner: { id: user.id, name: user.name },
    });
    return video.save();
  }

  async getVideos(): Promise<Array<VideoView>> {
    return this.videoModel
      .find()
      .exec()
      .then((videos) => {
        return videos.map(this.convertToView);
      });
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
