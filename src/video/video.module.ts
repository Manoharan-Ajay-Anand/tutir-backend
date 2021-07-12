import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { VideoController } from './video.controller';
import { Video, VideoSchema } from './schema/video.schema';
import { VideoService } from './service/video.service';
import { View, ViewSchema } from './schema/view.schema';
import { AnalyticsService } from './service/analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: View.name, schema: ViewSchema },
    ]),
    MediaModule,
    UserModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, AnalyticsService],
  exports: [VideoService],
})
export class VideoModule {}
