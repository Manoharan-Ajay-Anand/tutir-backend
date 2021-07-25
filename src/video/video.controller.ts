import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Types } from 'mongoose';
import {
  OptionalSessionAuthGuard,
  SessionAuthGuard,
} from '../auth/auth.guards';
import { MediaMulterEngine } from '../media/media.util';
import { AppResponse } from '../response/appResponse';
import { AppSuccess } from '../response/appSuccess';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { UnsupportedFileError } from '../media/media.error';
import { VideoService } from './service/video.service';
import { InvalidParamsError } from '../app.error';
import { MediaService } from '../media/media.service';
import { AnalyticsService } from './service/analytics.service';
import { convertToVideoView } from './schema/video.schema';

const multerOptions: MulterOptions = {
  storage: MediaMulterEngine,
  fileFilter(_req, file, cb) {
    if (
      (file.fieldname === 'video' && file.mimetype !== 'video/mp4') ||
      (file.fieldname === 'notes' && file.mimetype !== 'application/pdf') ||
      (file.fieldname === 'thumbnail' &&
        file.mimetype !== 'image/jpeg' &&
        file.mimetype !== 'image/png')
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
    private mediaService: MediaService,
    private analyticsService: AnalyticsService,
  ) {}

  @Post('upload')
  @UseGuards(SessionAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
        { name: 'notes' },
      ],
      multerOptions,
    ),
  )
  async uploadVideo(
    @Req() req,
    @UploadedFiles() files,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('tags') tags: Array<string>,
  ): Promise<AppResponse> {
    if (!title || !description || !tags || tags.length == 0) {
      throw new InvalidParamsError();
    }
    if (!files['video'] || !files['thumbnail']) {
      throw new InvalidParamsError();
    }
    const video: Express.Multer.File = files['video'][0];
    const thumbnail: Express.Multer.File = files['thumbnail'][0];
    const notes: Array<Express.Multer.File> = files['notes']
      ? files['notes']
      : [];
    const videoUrl = await this.mediaService.uploadFile(video, 'video');
    const thumbnailUrl = await this.mediaService.uploadFile(
      thumbnail,
      'thumbnail',
    );
    const notesUrlList = await Promise.all(
      notes.map((note) => this.mediaService.uploadFile(note, 'notes')),
    );
    const videoDoc = await this.videoService.createVideo(
      title,
      description,
      videoUrl,
      thumbnailUrl,
      notesUrlList,
      tags,
      req.user,
    );
    return new AppSuccess('video_uploaded', videoDoc);
  }

  @Post('delete')
  @UseGuards(SessionAuthGuard)
  deleteVideo(@Req() req, @Body('id') videoId: string): Promise<AppResponse> {
    return this.videoService
      .deleteVideo(new Types.ObjectId(videoId), req.user.id)
      .then(() => {
        return new AppSuccess('video_deleted');
      });
  }

  @Get('')
  @UseGuards(OptionalSessionAuthGuard)
  async getVideos(
    @Req() req,
    @Query('id') id: string,
    @Query('owner') owner: string,
    @Query('tag') tags: Array<string>,
  ): Promise<AppResponse> {
    let payload: any;
    if (id) {
      const videoId = new Types.ObjectId(id);
      payload = await this.videoService
        .getVideoById(videoId)
        .then(convertToVideoView);
      await this.videoService.incrementView(videoId);
      if (req.user) {
        const user = await this.userService.findOne(req.user.id);
        await this.analyticsService.addView(payload, req.user.id);
        payload.isFavourite = user.favourites.includes(payload.id);
      }
    } else if (owner) {
      payload = await this.videoService.getVideosByOwner(
        new Types.ObjectId(owner),
      );
    } else if (tags) {
      payload = await this.analyticsService.getTopVideosByTags(tags);
    } else {
      if (req.user) {
        payload = await this.analyticsService.getRecommendedVideos(req.user.id);
      } else {
        payload = await this.analyticsService.getTopVideos();
      }
    }
    return new AppSuccess('videos_retrieved', payload);
  }

  @Post('favourites/add')
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

  @Post('favourites/remove')
  @UseGuards(SessionAuthGuard)
  async removeFavourite(
    @Req() req,
    @Body('video') video: string,
  ): Promise<AppResponse> {
    const videoId = new Types.ObjectId(video);
    await this.videoService.getVideoById(videoId);
    this.userService.removeFavouriteVideo(req.user.id, videoId);
    return new AppSuccess('favourites_remove');
  }

  @Get('favourites')
  @UseGuards(SessionAuthGuard)
  async getFavourites(@Req() req): Promise<AppResponse> {
    const user: UserDocument = await this.userService.findOne(req.user.id);
    const videos = await this.videoService.getVideosByIdList(user.favourites);
    return new AppSuccess('favourites_retrieved', videos);
  }

  @Get('history')
  @UseGuards(SessionAuthGuard)
  async getHistory(@Req() req): Promise<AppResponse> {
    return this.analyticsService.getHistory(req.user.id).then((videos) => {
      return new AppSuccess('history_retrieved', videos);
    });
  }

  @Get('tags')
  getTags(): Promise<AppResponse> {
    return this.analyticsService
      .getTopVideoTags()
      .then((tags) => new AppSuccess('tags_retrieved', tags));
  }

  @Get('search')
  async searchVideos(@Query('q') query: string): Promise<AppResponse> {
    const videos = await this.analyticsService.searchVideo(query);
    await this.analyticsService.addSearchQuery(query, videos.length);
    return new AppSuccess('search_retrieved', videos);
  }

  @Get('autocomplete')
  autoCompleteQuery(@Query('q') query: string): Promise<AppResponse> {
    return this.analyticsService
      .autoCompleteSearchQuery(query)
      .then((results) => new AppSuccess('autocomplete_retrieved', results));
  }

  @Get('viewership')
  getViewership(@Query('creatorId') creatorId: string): Promise<AppResponse> {
    return this.analyticsService
      .getViewership(new Types.ObjectId(creatorId))
      .then((data) => new AppSuccess('viewership_retrieved', data));
  }
}
