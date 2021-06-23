import base64url from 'base64url';
import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';

export const MediaMulterEngine = diskStorage({
  filename(_req, file, cb) {
    let extension = '';
    if (file.mimetype === 'video/mp4') {
      extension = '.mp4';
    } else if (file.mimetype === 'application/pdf') {
      extension = '.pdf';
    } else if (file.mimetype === 'image/jpeg') {
      extension = '.jpeg';
    } else if (file.mimetype === 'image/png') {
      extension = '.png';
    }
    const name = base64url.encode(randomBytes(24));
    cb(null, name + extension);
  },
});
