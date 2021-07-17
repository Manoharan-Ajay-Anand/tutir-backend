import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Types } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { UserOnboardedError } from './stripe.error';

interface OnboardInfo {
  accountId: string;
  link: string;
}

@Injectable()
export class StripeService {
  stripe: Stripe;
  webHookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
    this.webHookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  private async createConnectAccount(
    userId: Types.ObjectId,
  ): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type: 'standard',
      metadata: {
        userId: userId.toHexString(),
      },
    });
  }

  async getOnboardInfo(user: UserDocument): Promise<OnboardInfo> {
    let accountId: string;
    if (user.connectAccount.enabled) {
      throw new UserOnboardedError();
    } else if (user.connectAccount.id) {
      accountId = user.connectAccount.id;
    } else {
      const account = await this.createConnectAccount(user._id);
      accountId = account.id;
    }
    return this.stripe.accountLinks
      .create({
        account: accountId,
        type: 'account_onboarding',
        refresh_url: process.env.STRIPE_REFRESH_URL,
        return_url: process.env.STRIPE_RETURN_URL,
      })
      .then((link) => ({ accountId: accountId, link: link.url }));
  }

  constructEvent(body: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      body,
      signature,
      this.webHookSecret,
    );
  }
}
