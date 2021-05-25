import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  passwordHash: string;
}

export interface UserView {
  id: string;
  name: string;
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
