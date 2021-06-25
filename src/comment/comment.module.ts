import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoModule } from 'src/video/video.module';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema } from './comment.schema';
import { CommentService } from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    VideoModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
