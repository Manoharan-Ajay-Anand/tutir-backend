import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from 'src/media/media.module';
import { UserModule } from 'src/user/user.module';
import { VideoController } from './video.controller';
import { Video, VideoSchema } from './video.schema';
import { VideoService } from './video.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MediaModule,
    UserModule,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
