import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VideoService } from '../../video/service/video.service';
import { UserService } from '../../user/user.service';
import { StripeService } from '../service/stripe.service';
import { TipService } from '../service/tip.service';
import { SessionAuthGuard } from '../../auth/auth.guards';
import { UserView } from '../../user/user.schema';
import { Types } from 'mongoose';
import { CannotCancelTipError, CannotTipError } from '../error/tip.error';
import { AppResponse } from '../../response/appResponse';
import { AppSuccess } from '../../response/appSuccess';

@Controller('tip')
@UseGuards(SessionAuthGuard)
export class TipController {
  constructor(
    private userService: UserService,
    private videoService: VideoService,
    private tipService: TipService,
    private stripeService: StripeService,
  ) {}

  @Post('create')
  async createTip(
    @Req() req,
    @Body('videoId') videoId: string,
    @Body('amount') amount: number,
  ): Promise<AppResponse> {
    const user: UserView = req.user;
    const applicationFee = 0.02 * amount + 10;
    const video = await this.videoService.getVideoById(
      new Types.ObjectId(videoId),
    );
    if (!video.canTip) {
      throw new CannotTipError();
    }
    const owner = await this.userService.findOne(video.owner.id);
    const tipId = new Types.ObjectId();
    const paymentIntent = await this.stripeService.createPaymentIntent(
      tipId,
      amount,
      applicationFee,
      owner.connectAccount.id,
    );
    await this.tipService.createTip(
      tipId,
      amount,
      applicationFee,
      user.id,
      video,
      paymentIntent.id,
      owner.connectAccount.id,
    );
    return new AppSuccess('tip_created', {
      id: tipId,
      clientSecret: paymentIntent.client_secret,
    });
  }

  @Post('cancel')
  async cancelTip(
    @Req() req,
    @Body('tipId') tipId: string,
  ): Promise<AppResponse> {
    const tip = await this.tipService.findTip(new Types.ObjectId(tipId));
    if (!tip.payerId.equals(req.user.id)) {
      throw new CannotCancelTipError();
    }
    await this.stripeService.cancelPaymentIntent(
      tip.paymentIntentId,
      tip.payee.connectAccountId,
    );
    await this.tipService.cancelTip(tip._id);
    return new AppSuccess('tip_cancelled');
  }
}
