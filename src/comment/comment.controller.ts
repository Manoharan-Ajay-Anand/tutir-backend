import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { AppSuccess } from 'src/response/appSuccess';
import { VideoService } from 'src/video/service/video.service';
import { SessionAuthGuard } from '../auth/auth.guards';
import { AppResponse } from '../response/appResponse';
import { CommentService } from './comment.service';

@UseGuards(SessionAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(
    private commentService: CommentService,
    private videoService: VideoService,
  ) {}

  @Post('add')
  async addComment(
    @Req() req,
    @Body('videoId') videoId,
    @Body('text') text: string,
  ): Promise<AppResponse> {
    const id = new Types.ObjectId(videoId);
    await this.videoService.incrementComment(id);
    const comment = await this.commentService.addComment(req.user, id, text);
    return new AppSuccess('comment_added', comment);
  }
}
