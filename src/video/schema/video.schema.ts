import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
  owner: {
    id: Types.ObjectId;
    name: string;
    profileImageUrl: string;
  };

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: false })
  canTip: boolean;
}

export interface VideoView {
  id: Types.ObjectId;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  notes: Array<string>;
  tags: Array<string>;
  owner: {
    id: Types.ObjectId;
    name: string;
    profileImageUrl: string;
  };
  canTip: boolean;
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
    owner: {
      id: video.owner.id,
      name: video.owner.name,
      profileImageUrl: video.owner.profileImageUrl,
    },
    canTip: video.canTip,
    views: video.views,
    comments: video.comments,
    uploadDate: video._id.getTimestamp(),
  };
}
