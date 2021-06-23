import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import base64url from 'base64url';
import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';
import { SessionAuthGuard } from 'src/auth/auth.guards';
import { AppResponse } from 'src/response/appResponse';
import { AppSuccess } from 'src/response/appSuccess';
import { UserDocument } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { UnsupportedFileError } from '../media/media.error';
import { VideoService } from './video.service';

const multerOptions: MulterOptions = {
  storage: diskStorage({
    filename(_req, file, cb) {
      let extension = '';
      if (file.mimetype === 'video/mp4') {
        extension = '.mp4';
      } else if (file.mimetype === 'application/pdf') {
        extension = '.pdf';
      }
      const name = base64url.encode(randomBytes(24));
      cb(null, name + extension);
    },
  }),
  fileFilter(_req, file, cb) {
    if (
      (file.fieldname === 'video' && file.mimetype !== 'video/mp4') ||
      (file.fieldname === 'notes' && file.mimetype !== 'application/pdf')
    ) {
      return cb(new UnsupportedFileError(), false);
    }
    cb(null, true);
  },
};

@Controller('video')
export class VideoController {
  constructor(
    private videoService: VideoService,
    private userService: UserService,
  ) {}

  @Post('upload')
  @UseGuards(SessionAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'video', maxCount: 1 }, { name: 'notes' }],
      multerOptions,
    ),
  )
  async uploadVideo(
    @Req() req,
    @UploadedFiles() files,
    @Body('title') title: string,
    @Body('description') description: string,
  ): Promise<AppResponse> {
    const video: Express.Multer.File = files['video'][0];
    const notes: Array<Express.Multer.File> = files['notes'];
    await this.videoService.createVideo(
      title,
      description,
      video,
      notes,
      req.user,
    );
    return new AppSuccess('video_uploaded');
  }

  @Get('')
  async getVideos(): Promise<AppResponse> {
    const videos = await this.videoService.getVideos();
    return new AppSuccess('videos_retrieved', videos);
  }

  @Post('favourites')
  @UseGuards(SessionAuthGuard)
  async addFavourite(
    @Req() req,
    @Body('video') video: string,
  ): Promise<AppResponse> {
    const videoId = new Types.ObjectId(video);
    await this.videoService.getVideoById(videoId);
    this.userService.addFavouriteVideo(req.user.id, videoId);
    return new AppSuccess('favourites_added');
  }

  @Get('favourites')
  @UseGuards(SessionAuthGuard)
  async getFavourites(@Req() req): Promise<AppResponse> {
    const user: UserDocument = await this.userService.findOne(req.user.id);
    const videos = await this.videoService.getVideosByIdList(user.favourites);
    return new AppSuccess('favourites_retrieved', videos);
  }

  @Get(':id')
  async getVideoById(@Param() params): Promise<AppResponse> {
    const videoId = new Types.ObjectId(params.id);
    const video = await this.videoService.getVideoById(videoId);
    return new AppSuccess('video_retrieved', video);
  }
}
