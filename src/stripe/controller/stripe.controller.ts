import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { AppSuccess } from '../../response/appSuccess';
import { UserService } from '../../user/user.service';
import Stripe from 'stripe';
import { SessionAuthGuard } from '../../auth/auth.guards';
import { AppResponse } from '../../response/appResponse';
import { StripeService } from '../service/stripe.service';
import { VideoService } from '../../video/service/video.service';
import { TipService } from '../service/tip.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private userService: UserService,
    private videoService: VideoService,
    private tipService: TipService,
  ) {}

  @Get('onboard')
  @UseGuards(SessionAuthGuard)
  async onboardAccount(@Req() req): Promise<AppResponse> {
    const user = await this.userService.findOne(req.user.id);
    const info = await this.stripeService.getOnboardInfo(user);
    await this.userService.updateConnectAccount(
      user._id,
      info.accountId,
      false,
    );
    return new AppSuccess('onboard_link', info.link);
  }

  @Post('webhook')
  async onWebHookEvent(
    @Headers('stripe-signature') signature,
    @Body() body,
    @Res() res: Response,
  ) {
    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(body, signature);
    } catch (err) {
      console.log(err);
      return res.status(400).send(err);
    }
    console.log(`Received Stripe event: ${event.type}`);
    switch (event.type) {
      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        const userId = new Types.ObjectId(account.metadata.userId);
        this.userService
          .updateConnectAccount(userId, account.id, account.details_submitted)
          .catch((err) => console.log(err));
        this.videoService.updateTipAbility(userId, account.details_submitted);
        break;
      case 'account.application.deauthorized':
        const accountId = event.account;
        this.userService
          .findOne(undefined, undefined, accountId)
          .then((user) => {
            if (!user) {
              throw Error('User with connect account cannot be found');
            }
            this.userService.deactivateConnectAccount(user._id);
            this.videoService.updateTipAbility(user._id, false);
          });
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.tipService.updateTipStatus(
          new Types.ObjectId(paymentIntent.metadata.tipId),
          true,
        );
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    return res.json({ received: true });
  }
}
