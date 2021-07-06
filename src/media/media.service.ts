import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { env } from 'process';
import fs = require('fs');
import sharp = require('sharp');
import { Stream } from 'stream';

const storage = new Storage();

@Injectable()
export class MediaService {
  uploadFile(file: Express.Multer.File, category: string): Promise<string> {
    const dest = `${category}/${file.filename}`;
    const fileObj = storage.bucket(env.BUCKET_NAME).file(dest);
    let stream: Stream = fs.createReadStream(file.path);
    if (file.mimetype.startsWith('image')) {
      stream = stream.pipe(
        sharp().resize(480, 360, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        }),
      );
    }
    return new Promise((resolve, reject) => {
      stream
        .pipe(
          fileObj.createWriteStream({
            metadata: {
              contentType: file.mimetype,
              cacheControl: 'public, max-age=604800, immutable',
            },
          }),
        )
        .on('error', () => {
          reject('Unable to upload');
        })
        .on('finish', () => {
          resolve((env.STORAGE_URL || '/') + dest);
        });
    });
  }
}
