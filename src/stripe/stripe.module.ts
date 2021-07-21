import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoModule } from '../video/video.module';
import { UserModule } from '../user/user.module';
import { StripeController } from './controller/stripe.controller';
import { StripeService } from './service/stripe.service';
import { TipService } from './service/tip.service';
import { Tip, TipSchema } from './tip.schema';
import { TipController } from './controller/tip.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tip.name, schema: TipSchema }]),
    UserModule,
    VideoModule,
  ],
  providers: [StripeService, TipService],
  controllers: [StripeController, TipController],
  exports: [StripeService],
})
export class StripeModule {}
