import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Owner } from '../../user/user.schema';

export type VideoDocument = Video & Document;

@Schema()
export class Video {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  url: string;

  @Prop()
  thumbnailUrl: string;

  @Prop([String])
  notes: string[];

  @Prop([String])
  tags: string[];

  @Prop(
    raw({
      id: { type: Types.ObjectId },
      name: { type: String },
      profileImageUrl: { type: String },
    }),
  )
  owner: Owner;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  comments: number;
}

export interface VideoView {
  id: Types.ObjectId;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  notes: Array<string>;
  tags: Array<string>;
  owner: Owner;
  views: number;
  comments: number;
  uploadDate: Date;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

export function convertToVideoView(video: VideoDocument): VideoView {
  return {
    id: video._id,
    title: video.title,
    description: video.description,
    url: video.url,
    thumbnailUrl: video.thumbnailUrl,
    notes: video.notes,
    tags: video.tags,
    owner: video.owner,
    views: video.views,
    comments: video.comments,
    uploadDate: video._id.getTimestamp(),
  };
}
