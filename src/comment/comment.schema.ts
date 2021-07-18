import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
  owner: { id: Types.ObjectId; name: string; profileImageUrl: string };
}

export interface CommentView {
  id: Types.ObjectId;
  text: string;
  owner: { id: Types.ObjectId; name: string; profileImageUrl: string };
}

export function convertToCommentView(comment: CommentDocument): CommentView {
  return {
    id: comment._id,
    text: comment.text,
    owner: comment.owner,
  };
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
