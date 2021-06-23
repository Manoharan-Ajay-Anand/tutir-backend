import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
