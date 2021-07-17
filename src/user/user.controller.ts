import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UnsupportedFileError } from '../media/media.error';
import { SessionAuthGuard } from '../auth/auth.guards';
import { AppResponse } from '../response/appResponse';
import { AppSuccess } from '../response/appSuccess';
import { UserView } from './user.schema';
import { UserService } from './user.service';
import { MediaMulterEngine } from '../media/media.util';
import { MediaService } from '../media/media.service';
import { InvalidParamsError } from '../app.error';

const multerOptions: MulterOptions = {
  storage: MediaMulterEngine,
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return cb(new UnsupportedFileError(), false);
    }
    cb(null, true);
  },
};

@UseGuards(SessionAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private mediaService: MediaService,
  ) {}

  @Get('')
  getUser(@Req() req): AppResponse {
    return new AppSuccess('user_retrieved', req.user);
  }

  @Post('name')
  async changeName(
    @Req() req,
    @Body('name') name: string,
  ): Promise<AppResponse> {
    const user: UserView = req.user;
    if (!name) {
      throw new InvalidParamsError();
    }
    return this.userService
      .changeName(user.id, name)
      .then((user) => new AppSuccess('profile_name_updated', user));
  }

  @Post('profileImage')
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  async uploadProfileImage(
    @Req() req,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const user: UserView = req.user;
    const profileImageUrl = await this.mediaService.uploadFile(
      profileImage,
      'images',
    );
    return this.userService
      .changeProfileImage(user.id, profileImageUrl)
      .then((user) => new AppSuccess('profile_image_updated', user));
  }
}
