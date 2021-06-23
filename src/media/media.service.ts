import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { env } from 'process';

const storage = new Storage();

@Injectable()
export class MediaService {
  async uploadFile(
    file: Express.Multer.File,
    category: string,
  ): Promise<string> {
    const dest = `${category}/${file.filename}`;
    await storage.bucket(env.BUCKET_NAME).upload(file.path, {
      destination: dest,
      contentType: file.mimetype,
    });
    return (env.STORAGE_URL || '/') + dest;
  }
}
