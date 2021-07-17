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
import { AppSuccess } from '../response/appSuccess';
import { UserService } from '../user/user.service';
import Stripe from 'stripe';
import { SessionAuthGuard } from '../auth/auth.guards';
import { AppResponse } from '../response/appResponse';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private userService: UserService,
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
        this.userService
          .updateConnectAccount(
            new Types.ObjectId(account.metadata.userId),
            account.id,
            account.details_submitted,
          )
          .catch((err) => console.log(err));
        break;
      case 'account.application.deauthorized':
        const accountId = event.account;
        this.userService.deactivateConnectAccount(accountId);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    return res.json({ received: true });
  }
}
