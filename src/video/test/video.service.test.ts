import { Types } from 'mongoose';
import { UserView } from '../../user/user.schema';
import { VideoView } from '../schema/video.schema';
import { VideoService } from '../service/video.service';

export class TestVideoService extends VideoService {
  constructor() {
    super(null);
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
    return {
      id: new Types.ObjectId(),
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
      views: 0,
      comments: 0,
      uploadDate: new Date(),
      canTip: false,
    };
  }
}
