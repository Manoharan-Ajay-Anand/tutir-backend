import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import base64url from 'base64url';
import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';
import { UnsupportedFileError } from '../media/media.error';
import { SessionAuthGuard } from '../auth/auth.guards';
import { AppResponse } from '../response/appResponse';
import { AppSuccess } from '../response/appSuccess';
import { UserView } from './user.schema';
import { UserService } from './user.service';

const multerOptions: MulterOptions = {
  storage: diskStorage({
    filename(_req, file, cb) {
      let extension = '';
      if (file.mimetype === 'image/jpeg') {
        extension = '.jpeg';
      } else if (file.mimetype === 'image/png') {
        extension = '.png';
      }
      const name = base64url.encode(randomBytes(24));
      cb(null, name + extension);
    },
  }),
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
  constructor(private userService: UserService) {}

  @Post('name')
  changeName(@Req() req, @Body('name') name): Promise<AppResponse> {
    const user: UserView = req.user;
    return this.userService
      .changeName(user.id, name)
      .then((user) => new AppSuccess('profile_update_success', user));
  }

  @Post('profileImage')
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  uploadProfileImage(@Req() req, @UploadedFile() profileImage) {
    const user: UserView = req.user;
    return this.userService
      .changeProfileImage(user.id, profileImage)
      .then((user) => new AppSuccess('profile_update_success', user));
  }
}
