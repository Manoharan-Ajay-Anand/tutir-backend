import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TipDocument = Tip & Document;

@Schema()
export class Tip {
  @Prop()
  amount: number;

  @Prop()
  applicationFee: number;

  @Prop()
  payerId: Types.ObjectId;

  @Prop(
    raw({
      id: { type: Types.ObjectId },
      title: { type: String },
    }),
  )
  video: {
    id: Types.ObjectId;
    title: string;
  };

  @Prop(
    raw({
      id: { type: Types.ObjectId },
      name: { type: String },
      profileImageUrl: { type: String },
      connectAccountId: { type: String },
    }),
  )
  payee: {
    id: Types.ObjectId;
    name: string;
    profileImageUrl: string;
    connectAccountId: string;
  };

  @Prop()
  paymentIntentId: string;

  @Prop()
  confirmed: boolean;
}

export interface TipView {
  id: Types.ObjectId;
  amount: number;
  applicationFee: number;
  video: {
    id: Types.ObjectId;
    title: string;
  };
  payee: {
    id: Types.ObjectId;
    name: string;
    profileImageUrl: string;
  };
}

export const TipSchema = SchemaFactory.createForClass(Tip);

export function convertToTipView(tip: TipDocument): TipView {
  return {
    id: tip._id,
    amount: tip.amount,
    applicationFee: tip.applicationFee,
    video: tip.video,
    payee: {
      id: tip.payee.id,
      name: tip.payee.name,
      profileImageUrl: tip.payee.profileImageUrl,
    },
  };
}
