import { MediaService } from '../media.service';

export class TestMediaService extends MediaService {
  async uploadFile(
    file: Express.Multer.File,
    category: string,
  ): Promise<string> {
    return `http://test.com/${category}/${file.filename}`;
  }
}
