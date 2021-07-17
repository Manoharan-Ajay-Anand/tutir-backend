import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
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

  @Prop(
    raw({
      id: { type: String, default: null },
      enabled: { type: Boolean, default: false },
    }),
  )
  connectAccount: { id: string; enabled: boolean };
}

export interface UserView {
  id: Types.ObjectId;
  name: string;
  email: string;
  profileImageUrl: string;
  stripeConnected: boolean;
}

export function convertToUserView(user: UserDocument): UserView {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    stripeConnected: user.connectAccount.enabled,
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
