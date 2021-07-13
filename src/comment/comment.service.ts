import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserView } from 'src/user/user.schema';
import {
  Comment,
  CommentDocument,
  CommentView,
  convertToCommentView,
} from './comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  addComment(
    user: UserView,
    videoId: Types.ObjectId,
    text: string,
  ): Promise<CommentView> {
    const comment = new this.commentModel({
      videoId: videoId,
      text: text,
      owner: {
        id: user.id,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
    });
    return comment.save().then(convertToCommentView);
  }

  getComments(videoId: Types.ObjectId): Promise<Array<CommentView>> {
    return this.commentModel
      .find({ videoId: videoId })
      .exec()
      .then((comments) => comments.map(convertToCommentView));
  }
}
