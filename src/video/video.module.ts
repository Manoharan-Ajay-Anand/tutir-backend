import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from 'src/media/media.module';
import { UserModule } from 'src/user/user.module';
import { VideoController } from './video.controller';
import { Video, VideoSchema } from './schema/video.schema';
import { VideoService } from './service/video.service';
import { View, ViewSchema } from './schema/view.schema';
import { ViewService } from './service/view.service';

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
  providers: [VideoService, ViewService],
  exports: [VideoService],
})
export class VideoModule {}
