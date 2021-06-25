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
}

export const VideoSchema = SchemaFactory.createForClass(Video);
