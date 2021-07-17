import { Types } from 'mongoose';
import { UserView } from '../../user/user.schema';
import { VideoService } from '../service/video.service';
import { TestVideoService } from './video.service.test';
import { VideoController } from '../video.controller';
import { InvalidParamsError } from '../../app.error';
import { TestMediaService } from '../../media/test/media.service.test';
import { MediaService } from '../../media/media.service';

const testUser: UserView = {
  id: new Types.ObjectId(),
  name: 'testUser',
  email: 'testUser@gmail.com',
  profileImageUrl: 'http://test.com/images/profileImage.jpeg',
  stripeConnected: false,
};

const testVideo: Express.Multer.File = {
  fieldname: null,
  filename: 'testVideo.mp4',
  mimetype: 'video/mp4',
  buffer: null,
  originalname: null,
  size: 0,
  stream: null,
  destination: 'testDir',
  encoding: null,
  path: 'testDir/testVideo.mp4',
};

const testThumbnail: Express.Multer.File = {
  fieldname: null,
  filename: 'testThumbnail.jpeg',
  mimetype: 'image/jpeg',
  buffer: null,
  originalname: null,
  size: 0,
  stream: null,
  destination: 'testDir',
  encoding: null,
  path: 'testDir/testThumbnail.jpeg',
};

const testNote: Express.Multer.File = {
  fieldname: null,
  filename: 'testNote.pdf',
  mimetype: 'application/pdf',
  buffer: null,
  originalname: null,
  size: 0,
  stream: null,
  destination: 'testDir',
  encoding: null,
  path: 'testDir/testNote.pdf',
};

describe('video', () => {
  let videoService: VideoService;
  let mediaService: MediaService;
  let videoController: VideoController;
  beforeAll(() => {
    mediaService = new TestMediaService();
    videoService = new TestVideoService();
    videoController = new VideoController(
      videoService,
      null,
      mediaService,
      null,
    );
  });
  describe('uploadVideo', () => {
    it('should throw InvalidParamsError', () => {
      expect(
        videoController.uploadVideo(
          { user: testUser },
          { video: [testVideo], thumbnail: [testThumbnail], notes: [testNote] },
          'testVideo',
          'this is a test video',
          [],
        ),
      ).rejects.toBeInstanceOf(InvalidParamsError);
    });
    it('should be successful', () => {
      expect(
        videoController.uploadVideo(
          { user: testUser },
          { video: [testVideo], thumbnail: [testThumbnail], notes: [testNote] },
          'testVideo',
          'this is a test video',
          ['test'],
        ),
      ).resolves.toMatchObject({
        payload: expect.objectContaining({
          url: 'http://test.com/video/testVideo.mp4',
          thumbnailUrl: 'http://test.com/thumbnail/testThumbnail.jpeg',
          notes: expect.arrayContaining(['http://test.com/notes/testNote.pdf']),
        }),
      });
    });
  });
});
