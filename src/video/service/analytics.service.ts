import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Search, SearchDocument } from '../schema/search.schema';
import {
  convertToVideoView,
  Video,
  VideoDocument,
  VideoView,
} from '../schema/video.schema';
import { View, ViewDocument } from '../schema/view.schema';
import { VideoService } from './video.service';

const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

@Injectable()
export class AnalyticsService {
  constructor(
    private videoService: VideoService,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(View.name) private viewModel: Model<ViewDocument>,
    @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
  ) {}

  async addView(video: VideoView, viewerId: Types.ObjectId) {
    const view = new this.viewModel({
      videoId: video.id,
      viewerId: viewerId,
      creatorId: video.owner.id,
      tags: video.tags,
    });
    await view.save();
  }

  async getHistory(viewerId: Types.ObjectId): Promise<Array<VideoView>> {
    const videoIdList = await this.viewModel
      .aggregate([
        { $match: { viewerId: viewerId } },
        { $group: { _id: '$videoId', viewId: { $max: '$_id' } } },
        { $sort: { viewId: -1 } },
      ])
      .exec()
      .then((docs) => docs.map((doc) => doc._id));
    return this.videoService.getVideosByIdList(videoIdList);
  }

  getTopVideos(): Promise<Array<VideoView>> {
    return this.videoModel
      .find()
      .sort({ views: -1 })
      .exec()
      .then((videos) => videos.map(convertToVideoView));
  }

  getTopVideosByTags(tags: Array<string>): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ tags: { $in: tags } })
      .sort({ views: -1 })
      .exec()
      .then((videos) => videos.map(convertToVideoView));
  }

  async getRecommendedVideos(
    viewerId: Types.ObjectId,
  ): Promise<Array<VideoView>> {
    const tagList: Array<string> = await this.viewModel
      .aggregate([
        { $match: { viewerId: viewerId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
      ])
      .exec()
      .then((docs) => docs.map((doc) => doc._id));
    return this.videoModel
      .aggregate([
        {
          $addFields: {
            matchedTags: { $size: { $setIntersection: [tagList, '$tags'] } },
          },
        },
        { $sort: { matchedTags: -1 } },
      ])
      .exec()
      .then((videos) => videos.map(convertToVideoView));
  }

  getTopVideoTags(): Promise<Array<string>> {
    return this.videoModel
      .aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', number: { $sum: 1 } } },
        { $sort: { number: -1 } },
        { $limit: 20 },
      ])
      .exec()
      .then((docs) => docs.map((doc) => doc._id));
  }

  searchVideo(query: string): Promise<Array<VideoView>> {
    return this.videoModel
      .find({ $text: { $search: query } })
      .sort({ score: { $meta: 'textScore' } })
      .exec()
      .then((videos) => videos.map(convertToVideoView));
  }

  async addSearchQuery(query: string, results: number) {
    await this.searchModel
      .updateOne(
        { query: query },
        { $set: { results: results } },
        { upsert: true },
      )
      .exec();
  }

  autoCompleteSearchQuery(query: string): Promise<Array<string>> {
    return this.searchModel
      .find({ $text: { $search: query } })
      .sort({ results: -1 })
      .exec()
      .then((searches) => searches.map((search) => search.query));
  }

  async getViewership(creatorId: Types.ObjectId) {
    const data = {};
    const views = await this.viewModel
      .aggregate([
        { $match: { creatorId: creatorId } },
        {
          $project: {
            year: { $year: '$_id' },
            month: { $month: '$_id' },
          },
        },
        { $match: { year: new Date().getUTCFullYear() } },
        { $group: { _id: '$month', views: { $sum: 1 } } },
      ])
      .exec();
    views.forEach((view) => {
      data[months[view._id - 1]] = view.views;
    });
    return data;
  }
}
