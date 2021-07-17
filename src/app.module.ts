import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { raw, json } from 'body-parser';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { StripeModule } from './stripe/stripe.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, { useFindAndModify: false }),
    AuthModule,
    VideoModule,
    CommentModule,
    UserModule,
    StripeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(raw({ type: 'application/json' }))
      .forRoutes({ path: '/stripe/webhook', method: RequestMethod.POST })
      .apply(json())
      .forRoutes('*');
  }
}
