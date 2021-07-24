import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ViewDocument = View & Document;

@Schema()
export class View {
  @Prop()
  videoId: Types.ObjectId;

  @Prop()
  viewerId: Types.ObjectId;

  @Prop()
  creatorId: Types.ObjectId;

  @Prop([String])
  tags: string[];
}

export const ViewSchema = SchemaFactory.createForClass(View);
