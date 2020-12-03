import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { LoggerService } from './logger.service';
import { FileService } from './file.service';
import { expect } from 'chai';

describe('FileService', () => {
  let log: SinonStubbedInstance<LoggerService>;
  let fileService: FileService;

  beforeEach(() => {
    log = createStubInstance(LoggerService);
    fileService = new FileService(log);
  });

  describe('getLanguageFiles', () => {
    it.only('should return the list of file names in the translations directory', async () => {
      const expected = ['en', 'nl', 'ro'];
      const files = await fileService.getLanguageFiles();
      expect(files).to.deep.eq(expected);
    });
  });
});
