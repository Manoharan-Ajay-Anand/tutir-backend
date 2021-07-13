import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Owner } from '../user/user.schema';

export type CommentDocument = Comment & Document;

@Schema()
export class Comment {
  @Prop({ type: Types.ObjectId })
  videoId: Types.ObjectId;

  @Prop()
  text: string;

  @Prop(
    raw({
      id: { type: Types.ObjectId },
      name: { type: String },
      profileImageUrl: { type: String },
    }),
  )
  owner: Owner;
}

export interface CommentView {
  id: Types.ObjectId;
  text: string;
  owner: Owner;
}

export function convertToCommentView(comment: CommentDocument): CommentView {
  return {
    id: comment._id,
    text: comment.text,
    owner: comment.owner,
  };
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
