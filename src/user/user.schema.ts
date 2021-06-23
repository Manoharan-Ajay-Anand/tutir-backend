import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  passwordHash: string;

  @Prop({ default: null })
  profileImageUrl: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  favourites: Array<Types.ObjectId>;
}

export interface UserView {
  id: Types.ObjectId;
  name: string;
  email: string;
  profileImageUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
